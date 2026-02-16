from __future__ import annotations

import uuid
from datetime import datetime
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.realtime.socketio_server import sio
from app.core.config import settings
from app.core.db import SessionLocal  # اگر نداری، از همان engine/session پروژه‌ات استفاده کن
from app.models.user import User
from app.services import chat_service
from app.realtime.rate_limit import rate_limit_socket

# ✅ این را مطابق پروژه‌ات تنظیم کن:
# مثلا اگر در app/core/redis.py چیزی مثل "r" یا "redis" داری، اینجا درستش کن
from app.core.redis import redis_client  # <- اگر نداری، یا بساز یا نام واقعی را جایگزین کن

ALGORITHM = "HS256"

ROOM_ADMINS = "admins"


def _identity_key(session: dict) -> str:
    if session["type"] == "user":
        return f"user:{session['user_id']}"
    return f"guest:{session['guest_id']}"


async def _authenticate_socket(auth) -> dict | None:
    """
    auth: { token?, guest_id? }
    """
    if not auth:
        return None

    token = auth.get("token")
    guest_id = auth.get("guest_id")

    if token:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if not user_id:
                return None
            user_uuid = uuid.UUID(user_id)
        except (JWTError, ValueError):
            return None

        db: Session = SessionLocal()
        try:
            user = db.query(User).filter(User.id == user_uuid).first()
            if not user or not user.is_active:
                return None
            return {
                "type": "user",
                "user_id": str(user.id),
                "is_admin": bool(user.is_admin),
            }
        finally:
            db.close()

    if guest_id:
        try:
            g = uuid.UUID(guest_id)
            return {"type": "guest", "guest_id": str(g)}
        except ValueError:
            return None

    return None


@sio.event
async def connect(sid, environ, auth):
    ident = await _authenticate_socket(auth)
    if not ident:
        return False
    await sio.save_session(sid, ident)
    
    if ident.get("type") == "user" and ident.get("is_admin"):
        await sio.enter_room(sid, ROOM_ADMINS)
    return True


@sio.event
async def join_conversation(sid, data):
    """
    data: { conversation_id }
    """
    conv_id = data.get("conversation_id")
    if not conv_id:
        await sio.emit("error", {"message": "conversation_id is required"}, to=sid)
        return

    room = f"conv:{conv_id}"
    await sio.enter_room(sid, room)
    await sio.emit("ok", {"joined": room}, to=sid)


@sio.event
async def conversation_history(sid, data):
    """
    data: { conversation_id, limit?, offset? }
    """
    conv_id = data.get("conversation_id")
    limit = int(data.get("limit", 50))
    offset = int(data.get("offset", 0))
    limit = min(max(limit, 1), 200)

    db: Session = SessionLocal()
    try:
        res = chat_service.list_messages(db, uuid.UUID(conv_id), limit, offset)
        # datetime -> iso
        for it in res["items"]:
            it["created_at"] = it["created_at"].isoformat()
            it["id"] = str(it["id"])
            it["conversation_id"] = str(it["conversation_id"])
            it["sender_participant_id"] = str(it["sender_participant_id"])
        await sio.emit("history", res, to=sid)
    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
    finally:
        db.close()


@sio.event
async def send_message(sid, data):
    """
    Customer sends message (user/guest)
    data: { conversation_id, body }
    """
    sess = await sio.get_session(sid)
    conv_id = data.get("conversation_id")
    body = (data.get("body") or "").strip()
    if not conv_id or not body:
        await sio.emit("error", {"message": "conversation_id/body required"}, to=sid)
        return

    # Rate limit
    ident = _identity_key(sess)
    key = f"rl:chat:msg:{ident}:{conv_id}"
    # 30 پیام / 5 دقیقه برای guest، 100 پیام / 5 دقیقه برای user
    max_allowed = 100 if sess["type"] == "user" else 30
    allowed, ttl = rate_limit_socket(redis_client, key, 300, max_allowed)
    if not allowed:
        await sio.emit("rate_limited", {"retry_after": ttl}, to=sid)
        return

    db: Session = SessionLocal()
    try:
        # current_user/guest_id را به service بده
        current_user = None
        guest_id = None

        if sess["type"] == "user":
            # فقط id داریم؛ user object را لازم نداریم، ولی service current_user را می‌خواهد
            user_uuid = uuid.UUID(sess["user_id"])
            current_user = db.query(User).filter(User.id == user_uuid).first()
        else:
            guest_id = uuid.UUID(sess["guest_id"])

        msg = chat_service.add_customer_message(
            db,
            conversation_id=uuid.UUID(conv_id),
            body=body,
            current_user=current_user,
            guest_id=guest_id,
        )
        msg["id"] = str(msg["id"])
        msg["conversation_id"] = str(msg["conversation_id"])
        msg["sender_participant_id"] = str(msg["sender_participant_id"])
        msg["created_at"] = msg["created_at"].isoformat()

        room = f"conv:{conv_id}"
        await sio.emit("new_message", msg, room=room)

        # notify admins (برای اینکه همه ببینن یک چت جدید/پیام جدید آمد)
        await sio.emit("admin_notify", {"conversation_id": conv_id, "type": "new_message"}, room=ROOM_ADMINS)

    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
    finally:
        db.close()


@sio.event
async def admin_accept(sid, data):
    """
    data: { conversation_id }
    """
    sess = await sio.get_session(sid)
    if sess["type"] != "user" or not sess.get("is_admin"):
        await sio.emit("error", {"message": "Admin only"}, to=sid)
        return

    conv_id = data.get("conversation_id")
    if not conv_id:
        await sio.emit("error", {"message": "conversation_id required"}, to=sid)
        return

    # Rate limit accept هم بد نیست
    key = f"rl:chat:accept:user:{sess['user_id']}"
    allowed, ttl = rate_limit_socket(redis_client, key, 10, 10)  # 10 accept / 10s
    if not allowed:
        await sio.emit("rate_limited", {"retry_after": ttl}, to=sid)
        return

    db: Session = SessionLocal()
    try:
        admin_uuid = uuid.UUID(sess["user_id"])
        admin_user = db.query(User).filter(User.id == admin_uuid).first()
        if not admin_user or not admin_user.is_admin:
            await sio.emit("error", {"message": "Admin only"}, to=sid)
            return

        result = chat_service.admin_accept_conversation_race_safe(
            db,
            conversation_id=uuid.UUID(conv_id),
            admin_user=admin_user,
        )
        if not result:
            await sio.emit("accept_failed", {"conversation_id": conv_id}, to=sid)
            return

        # admin را وارد room هم بکن تا realtime پیام‌ها را بگیرد
        room = f"conv:{conv_id}"
        await sio.enter_room(sid, room)

        result["conversation_id"] = str(result["conversation_id"])
        result["assigned_agent_user_id"] = str(result["assigned_agent_user_id"])
        result["assigned_at"] = result["assigned_at"].isoformat()

        await sio.emit("accepted", result, room=room)
        await sio.emit("admin_notify", {"conversation_id": conv_id, "type": "accepted"}, room=ROOM_ADMINS)

    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
    finally:
        db.close()


@sio.event
async def admin_send_message(sid, data):
    """
    data: { conversation_id, body }
    """
    sess = await sio.get_session(sid)
    if sess["type"] != "user" or not sess.get("is_admin"):
        await sio.emit("error", {"message": "Admin only"}, to=sid)
        return

    conv_id = data.get("conversation_id")
    body = (data.get("body") or "").strip()
    if not conv_id or not body:
        await sio.emit("error", {"message": "conversation_id/body required"}, to=sid)
        return

    # Rate limit admin پیام
    key = f"rl:chat:admin_msg:user:{sess['user_id']}:{conv_id}"
    allowed, ttl = rate_limit_socket(redis_client, key, 300, 200)  # 200 پیام / 5 دقیقه
    if not allowed:
        await sio.emit("rate_limited", {"retry_after": ttl}, to=sid)
        return

    db: Session = SessionLocal()
    try:
        admin_uuid = uuid.UUID(sess["user_id"])
        admin_user = db.query(User).filter(User.id == admin_uuid).first()
        if not admin_user or not admin_user.is_admin:
            await sio.emit("error", {"message": "Admin only"}, to=sid)
            return

        msg = chat_service.add_admin_message(
            db,
            conversation_id=uuid.UUID(conv_id),
            admin_user=admin_user,
            body=body,
        )
        msg["id"] = str(msg["id"])
        msg["conversation_id"] = str(msg["conversation_id"])
        msg["sender_participant_id"] = str(msg["sender_participant_id"])
        msg["created_at"] = msg["created_at"].isoformat()

        await sio.emit("new_message", msg, room=f"conv:{conv_id}")

    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
    finally:
        db.close()


@sio.event
async def admin_close(sid, data):
    sess = await sio.get_session(sid)
    if sess["type"] != "user" or not sess.get("is_admin"):
        await sio.emit("error", {"message": "Admin only"}, to=sid)
        return

    conv_id = data.get("conversation_id")
    if not conv_id:
        await sio.emit("error", {"message": "conversation_id required"}, to=sid)
        return

    db: Session = SessionLocal()
    try:
        ok = chat_service.admin_close_conversation(db, conversation_id=uuid.UUID(conv_id))
        if not ok:
            await sio.emit("error", {"message": "Conversation not found"}, to=sid)
            return

        await sio.emit("closed", {"conversation_id": conv_id}, room=f"conv:{conv_id}")
        await sio.emit("admin_notify", {"conversation_id": conv_id, "type": "closed"}, room=ROOM_ADMINS)

    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
    finally:
        db.close()

@sio.event
async def rate_conversation(sid, data):
    try:
        _ = await sio.get_session(sid)  # فعلاً فقط برای اینکه auth/session معتبر باشه

        conversation_id = data.get("conversation_id")
        rating = data.get("rating")
        feedback = data.get("feedback")  # فعلاً ذخیره نمی‌شود

        if not conversation_id or rating is None:
            await sio.emit("error", {"message": "conversation_id and rating required"}, to=sid)
            return

        rating = int(rating)
        if rating < 1 or rating > 5:
            await sio.emit("error", {"message": "rating must be between 1 and 5"}, to=sid)
            return

        from app.services.chat_service import create_rating_once
        with SessionLocal() as db:
            r = create_rating_once(
                db,
                conversation_id=uuid.UUID(conversation_id),
                stars=rating,
            )

        await sio.emit(
            "conversation_rated",
            {
                "conversation_id": conversation_id,
                "rating": r.stars,
                "feedback": feedback,               # فقط echo
                "created_at": r.created_at.isoformat(),
            },
            room=f"conv:{conversation_id}"
        )

    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
