from __future__ import annotations

import uuid
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime
from app.realtime.socketio_server import sio
from app.core.config import settings
from app.core.db import SessionLocal
from app.models.user import User
from app.services import chat_service
from app.realtime.rate_limit import rate_limit_socket
from app.core.redis import redis_client
from urllib.parse import parse_qs
from app.models.chat import ChatParticipant, ParticipantRole

ALGORITHM = "HS256"
ROOM_ADMINS = "admins"


# =========================================================
# Helpers
# =========================================================

def _identity_key(session: dict) -> str:
    if session["type"] == "user":
        return f"user:{session['user_id']}"
    return f"guest:{session['guest_id']}"

def _get_query_params(environ: dict) -> dict[str, str]:
    """
    Socket.IO ASGI environ معمولاً QUERY_STRING را می‌دهد.
    parse_qs خروجی list می‌دهد، ما اولین مقدار را می‌گیریم.
    """
    raw = environ.get("QUERY_STRING") or ""
    parsed = parse_qs(raw, keep_blank_values=False)
    out: dict[str, str] = {}
    for k, v in parsed.items():
        if v:
            out[k] = v[0]
    return out

def _public_msg_payload(msg: dict) -> dict:
    """
    خروجی استاندارد پیام برای فرانت:
      id
      conversation_id
      body
      created_at
      sender_id
      is_admin
    """
    return {
        "id": str(msg["id"]),
        "conversation_id": str(msg["conversation_id"]),
        "body": msg["body"],
        "created_at": msg["created_at"].isoformat()
        if hasattr(msg["created_at"], "isoformat")
        else msg["created_at"],
        "sender_id": str(msg["sender_id"]),
        "is_admin": bool(msg["is_admin"]),
    }


async def _authenticate_socket(auth, environ: dict | None = None) -> dict | None:
    """
    اولویت احراز هویت:
      1) auth object (برای کلاینت‌های واقعی socket.io)
      2) query string (برای Postman)
    ورودی‌ها:
      - auth: { token?, guest_id? }
      - query: ?token=... یا ?guest_id=...
    """
    token = None
    guest_id = None

    # 1) auth
    if auth:
        token = auth.get("token")
        guest_id = auth.get("guest_id")

    # 2) query
    if (not token and not guest_id) and environ is not None:
        qp = _get_query_params(environ)
        token = qp.get("token") or None
        guest_id = qp.get("guest_id") or None

    # user token
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


# =========================================================
# Events
# =========================================================

@sio.event
async def connect(sid, environ, auth):
    ident = await _authenticate_socket(auth, environ)
    if not ident:
        return False

    await sio.save_session(sid, ident)

    if ident.get("type") == "user" and ident.get("is_admin"):
        await sio.enter_room(sid, ROOM_ADMINS)

    return True


@sio.event
async def join_conversation(sid, data, *args):
    """
    data: { conversation_id }
    """
    print("JOIN CALLED", sid, data)

    conv_id = data.get("conversation_id")
    if not conv_id:
        await sio.emit("error", {"message": "conversation_id is required"}, to=sid)
        return

    room = f"conv:{conv_id}"
    await sio.enter_room(sid, room)
    await sio.emit("ok", {"joined": room}, to=sid)


# ---------------------------------------------------------
# Thread (History)
# ---------------------------------------------------------

@sio.event
async def get_thread(sid, data, *args):
    """
    data: { conversation_id, limit?, offset? }
    """
    conv_id = data.get("conversation_id")
    if not conv_id:
        await sio.emit("error", {"message": "conversation_id is required"}, to=sid)
        return

    limit = min(max(int(data.get("limit", 50)), 1), 200)
    offset = max(int(data.get("offset", 0)), 0)

    db: Session = SessionLocal()
    try:
        res = chat_service.get_conversation_thread(
            db,
            uuid.UUID(conv_id),
            limit,
            offset,
        )

        # serialize
        res["conversation"]["id"] = str(res["conversation"]["id"])

        for it in res["items"]:
            it["id"] = str(it["id"])
            it["sender_id"] = str(it["sender_id"])
            it["created_at"] = it["created_at"].isoformat()

        await sio.emit("thread", res, to=sid)

    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
    finally:
        db.close()


@sio.event
async def conversation_history(sid, data, *args):
    return await get_thread(sid, data)


# ---------------------------------------------------------
# Customer Send Message
# ---------------------------------------------------------

@sio.event
async def send_message(sid, data, *args):
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

    ident = _identity_key(sess)
    key = f"rl:chat:msg:{ident}:{conv_id}"

    max_allowed = 100 if sess["type"] == "user" else 30
    allowed, ttl = rate_limit_socket(redis_client, key, 300, max_allowed)

    if not allowed:
        await sio.emit("rate_limited", {"retry_after": ttl}, to=sid)
        return

    db: Session = SessionLocal()
    try:
        current_user = None
        guest_id = None

        if sess["type"] == "user":
            user_uuid = uuid.UUID(sess["user_id"])
            current_user = db.query(User).filter(User.id == user_uuid).first()
        else:
            guest_id = uuid.UUID(sess["guest_id"])

        msg, is_new_conversation = chat_service.add_customer_message(
            db,
            conversation_id=uuid.UUID(conv_id),
            body=body,
            current_user=current_user,
            guest_id=guest_id,
        )

        payload = _public_msg_payload(msg)

        await sio.emit("new_message", payload, room=f"conv:{conv_id}")

        conversation = chat_service.get_conversation_summary(db, uuid.UUID(conv_id))

        if is_new_conversation:
            customer = db.scalar(
                select(ChatParticipant).where(
                    ChatParticipant.conversation_id == uuid.UUID(conv_id),
                    ChatParticipant.role == ParticipantRole.customer,
                )
            )
            customer_id = str(customer.guest_id or customer.user_id) if customer else None

            await sio.emit(
                "admin_notify",
                {
                    "type": "new_conversation",
                    "conversation": {
                        "id": conv_id,
                        "status": conversation["status"],
                        "label": None,
                        "assigned_agent_user_id": None,
                        "created_at": datetime.utcnow().isoformat(),
                        "customer_display_name": customer.display_name if customer else None,
                        "customer_email": customer.contact_email if customer else None,
                        "customer_id": customer_id,
                        "last_message": {
                            "body": payload["body"],
                            "created_at": payload["created_at"],
                        },
                    },
                },
                room=ROOM_ADMINS,
            )
        else:
            await sio.emit(
                "admin_notify",
                {
                    "type": "new_message",
                    "conversation_id": conv_id,
                    "last_message": {
                        "body": payload["body"],
                        "created_at": payload["created_at"],
                    },
                    "conversation": {
                        "id": conv_id,
                        "status": conversation["status"],
                        "guest_id": str(conversation["guest_id"]) if conversation.get("guest_id") else None,
                    },
                },
                room=ROOM_ADMINS,
            )

    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
    finally:
        db.close()


# ---------------------------------------------------------
# Admin Accept
# ---------------------------------------------------------

@sio.event
async def admin_accept(sid, data, *args):
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

    key = f"rl:chat:accept:user:{sess['user_id']}"
    allowed, ttl = rate_limit_socket(redis_client, key, 10, 10)

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

        # وارد روم شود
        await sio.enter_room(sid, f"conv:{conv_id}")

        result["conversation_id"] = str(result["conversation_id"])
        result["assigned_agent_user_id"] = str(result["assigned_agent_user_id"])
        result["assigned_at"] = result["assigned_at"].isoformat()

        await sio.emit("accepted", result, room=f"conv:{conv_id}")
        await sio.emit(
            "admin_notify",
            {"conversation_id": conv_id, "type": "accepted"},
            room=ROOM_ADMINS,
        )

    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
    finally:
        db.close()


# ---------------------------------------------------------
# Admin Send Message
# ---------------------------------------------------------

@sio.event
async def admin_send_message(sid, data, *args):
    sess = await sio.get_session(sid)

    if sess["type"] != "user" or not sess.get("is_admin"):
        await sio.emit("error", {"message": "Admin only"}, to=sid)
        return

    conv_id = data.get("conversation_id")
    body = (data.get("body") or "").strip()

    if not conv_id or not body:
        await sio.emit("error", {"message": "conversation_id/body required"}, to=sid)
        return

    key = f"rl:chat:admin_msg:user:{sess['user_id']}:{conv_id}"
    allowed, ttl = rate_limit_socket(redis_client, key, 300, 200)

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

        payload = _public_msg_payload(msg)

        await sio.emit("new_message", payload, room=f"conv:{conv_id}")

        await sio.emit(
            "admin_notify",
            {
                "type": "new_message",
                "conversation_id": conv_id,
                "last_message": {
                    "body": payload["body"],
                    "created_at": payload["created_at"],
                },
            },
            room=ROOM_ADMINS,
        )

    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
    finally:
        db.close()


# ---------------------------------------------------------
# Admin Close
# ---------------------------------------------------------

@sio.event
async def admin_close(sid, data, *args):
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
        ok = chat_service.admin_close_conversation(
            db,
            conversation_id=uuid.UUID(conv_id),
        )

        if not ok:
            await sio.emit("error", {"message": "Conversation not found"}, to=sid)
            return

        await sio.emit("closed", {"conversation_id": conv_id}, room=f"conv:{conv_id}")
        await sio.emit(
            "admin_notify",
            {"conversation_id": conv_id, "type": "closed"},
            room=ROOM_ADMINS,
        )

    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
    finally:
        db.close()


# ---------------------------------------------------------
# Rate Conversation
# ---------------------------------------------------------

@sio.event
async def rate_conversation(sid, data, *args):
    try:
        _ = await sio.get_session(sid)

        conversation_id = data.get("conversation_id")
        rating = data.get("rating")
        feedback = data.get("feedback")

        if not conversation_id or rating is None:
            await sio.emit(
                "error",
                {"message": "conversation_id and rating required"},
                to=sid,
            )
            return

        rating = int(rating)
        if rating < 1 or rating > 5:
            await sio.emit(
                "error",
                {"message": "rating must be between 1 and 5"},
                to=sid,
            )
            return

        with SessionLocal() as db:
            r = chat_service.create_rating_once(
                db,
                conversation_id=uuid.UUID(conversation_id),
                stars=rating,
            )

        await sio.emit(
            "conversation_rated",
            {
                "conversation_id": conversation_id,
                "rating": r.stars,
                "feedback": feedback,
                "created_at": r.created_at.isoformat(),
            },
            room=f"conv:{conversation_id}",
        )

    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
        
