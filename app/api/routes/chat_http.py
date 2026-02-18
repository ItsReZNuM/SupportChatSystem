from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, get_current_admin_user, get_current_user_optional
from app.models.user import User
from app.services import chat_service

from app.schemas.chat import (
    ConversationCreateIn,
    ConversationOut,
    PaginatedConversations,
    RatingCreateIn,
    SimpleChatThreadOut
)

router = APIRouter(prefix="/chat", tags=["chat"])

# --------------------
# Helpers
# --------------------
def get_current_user_optional(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> Optional[User]:

    if not authorization:
        return None

    raise HTTPException(
        status_code=500,
        detail="Implement get_current_user_optional in app/api/deps.py for HTTP routes",
    )


def parse_guest_id(x_guest_id: Optional[str]) -> Optional[uuid.UUID]:
    if not x_guest_id:
        return None
    try:
        return uuid.UUID(x_guest_id)
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid X-Guest-Id")


# --------------------
# Public
# --------------------
@router.post("/conversations", response_model=ConversationOut)
def create_conversation(
    payload: ConversationCreateIn,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional),
    x_guest_id: Optional[str] = Header(default=None, alias="X-Guest-Id"),
):
    guest_id = parse_guest_id(x_guest_id)

    try:
        conv, created_guest_id = chat_service.create_conversation(
            db,
            current_user=current_user,
            guest_id=guest_id,
            contact_email=str(payload.contact_email) if payload.contact_email else None,
            label=payload.label,
            display_name=payload.display_name,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return ConversationOut(
        id=conv.id,
        status=conv.status,
        label=conv.label,
        assigned_agent_user_id=conv.assigned_agent_user_id,
        created_at=conv.created_at.isoformat(),
        guest_id=created_guest_id, 
    )

@router.post("/conversations/rating/{conversation_id}")
def rate_conversation(
    conversation_id: uuid.UUID,
    payload: RatingCreateIn,
    db: Session = Depends(get_db),
):
    try:
        r = chat_service.create_rating_once(db, conversation_id=conversation_id, stars=payload.stars)
        return {
            "id": str(r.id),
            "conversation_id": str(r.conversation_id),
            "agent_user_id": str(r.agent_user_id),
            "stars": r.stars,
            "created_at": r.created_at.isoformat(),
        }
    except ValueError as e:
        msg = str(e)
        if "already exists" in msg:
            raise HTTPException(status_code=409, detail=msg)
        raise HTTPException(status_code=400, detail=msg)


# --------------------
# Admin
# --------------------
@router.get("/admin/conversations", response_model=PaginatedConversations)
def admin_list_conversations(
    status_filter: Optional[str] = None, 
    only_unassigned: bool = False,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user), 
):
    if status_filter and status_filter not in ("open", "in_progress", "closed"):
        raise HTTPException(status_code=422, detail="Invalid status_filter")

    limit = min(max(limit, 1), 200)
    return chat_service.admin_list_conversations(
        db, status_filter=status_filter, only_unassigned=only_unassigned, limit=limit, offset=offset
    )

@router.get("/conversations/messages/{conversation_id}", response_model=PaginatedConversations)
def get_messages(
    conversation_id: uuid.UUID,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    limit = min(max(limit, 1), 200)
    return chat_service.list_messages(db, conversation_id, limit, offset)


@router.get("/conversations/conversation_info/{conversation_id}/", response_model=SimpleChatThreadOut)
def get_thread_simple(
    conversation_id: uuid.UUID,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    limit = min(max(limit, 1), 200)
    offset = max(offset, 0)

    try:
        return chat_service.get_thread_simple(db, conversation_id, limit, offset)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))