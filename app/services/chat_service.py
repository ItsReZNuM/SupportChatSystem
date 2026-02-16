from __future__ import annotations

import uuid
from datetime import datetime
from sqlalchemy.orm import Session, aliased
from sqlalchemy import select, func, update, and_

from app.models.user import User
from app.models.chat import (
    ChatConversation, ChatParticipant, ChatMessage, ChatRating,
    ConversationStatus, ParticipantRole
)

def create_conversation(
    db: Session,
    *,
    current_user: User | None,
    guest_id: uuid.UUID | None,
    contact_email: str | None,
    label: str | None,
    display_name: str | None,
) -> tuple[ChatConversation, uuid.UUID | None]:
    """
    returns: (conversation, created_guest_id_if_any)
    """
    if not current_user and not contact_email:
        raise ValueError("contact_email is required for guests")

    conv = ChatConversation(
        status=ConversationStatus.open,
        label=label,
        created_at=datetime.utcnow(),
    )
    db.add(conv)
    db.flush()

    created_guest_id = None
    if current_user:
        participant = ChatParticipant(
            conversation_id=conv.id,
            role=ParticipantRole.customer,
            user_id=current_user.id,
            guest_id=None,
            display_name=display_name,
            contact_email=contact_email or current_user.email,
            created_at=datetime.utcnow(),
        )
        db.add(participant)
    else:
        if guest_id is None:
            created_guest_id = uuid.uuid4()
            guest_id = created_guest_id

        participant = ChatParticipant(
            conversation_id=conv.id,
            role=ParticipantRole.customer,
            user_id=None,
            guest_id=guest_id,
            display_name=display_name,
            contact_email=contact_email,
            created_at=datetime.utcnow(),
        )
        db.add(participant)

    db.commit()
    db.refresh(conv)
    return conv, created_guest_id


def get_conversation(db: Session, conversation_id: uuid.UUID) -> ChatConversation | None:
    return db.get(ChatConversation, conversation_id)


def list_messages(db: Session, conversation_id: uuid.UUID, limit: int, offset: int):
    total = db.scalar(
        select(func.count()).select_from(ChatMessage).where(ChatMessage.conversation_id == conversation_id)
    ) or 0

    rows = db.execute(
        select(ChatMessage, ChatParticipant.role)
        .join(ChatParticipant, ChatParticipant.id == ChatMessage.sender_participant_id)
        .where(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at.asc())
        .limit(limit)
        .offset(offset)
    ).all()

    items = []
    for msg, role in rows:
        items.append({
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            "body": msg.body,
            "created_at": msg.created_at,
            "sender_participant_id": msg.sender_participant_id,
            "sender_role": role,
            "display_name": msg.guest_display_name,
            "contact_email": msg.guest_contact_email,

        })

    return {"items": items, "total": total}


def _get_customer_participant_for_sender(
    db: Session,
    *,
    conversation_id: uuid.UUID,
    current_user: User | None,
    guest_id: uuid.UUID | None,
) -> ChatParticipant:
    if current_user:
        p = db.scalar(select(ChatParticipant).where(
            ChatParticipant.conversation_id == conversation_id,
            ChatParticipant.role == ParticipantRole.customer,
            ChatParticipant.user_id == current_user.id,
        ))
        if p:
            return p

    if guest_id:
        p = db.scalar(select(ChatParticipant).where(
            ChatParticipant.conversation_id == conversation_id,
            ChatParticipant.role == ParticipantRole.customer,
            ChatParticipant.guest_id == guest_id,
        ))
        if p:
            return p

    # fallback: فقط customer
    p = db.scalar(select(ChatParticipant).where(
        ChatParticipant.conversation_id == conversation_id,
        ChatParticipant.role == ParticipantRole.customer,
    ))
    if not p:
        raise ValueError("Participant not found")
    return p


def add_customer_message(
    db: Session,
    *,
    conversation_id: uuid.UUID,
    body: str,
    current_user: User | None,
    guest_id: uuid.UUID | None,
) -> dict:
    conv = db.get(ChatConversation, conversation_id)
    if not conv:
        raise ValueError("Conversation not found")
    if conv.status == ConversationStatus.closed:
        raise ValueError("Conversation is closed")

    sender = _get_customer_participant_for_sender(
        db,
        conversation_id=conversation_id,
        current_user=current_user,
        guest_id=guest_id,
    )
    is_guest = sender.guest_id is not None

    msg = ChatMessage(
        conversation_id=conversation_id,
        sender_participant_id=sender.id,
        body=body,
        created_at=datetime.utcnow(),

        guest_display_name=sender.display_name ,
        guest_contact_email=sender.contact_email ,
    )

    db.add(msg)
    db.commit()
    db.refresh(msg)

    return {
        "id": msg.id,
        "conversation_id": msg.conversation_id,
        "body": msg.body,
        "created_at": msg.created_at,
        "sender_participant_id": msg.sender_participant_id,
        "sender_role": sender.role,
        "display_name": msg.guest_display_name,
        "contact_email": msg.guest_contact_email,

    }


def add_admin_message(
    db: Session,
    *,
    conversation_id: uuid.UUID,
    admin_user: User,
    body: str,
) -> dict:
    conv = db.get(ChatConversation, conversation_id)
    if not conv:
        raise ValueError("Conversation not found")
    if conv.status == ConversationStatus.closed:
        raise ValueError("Conversation is closed")

    agent = db.scalar(select(ChatParticipant).where(
        ChatParticipant.conversation_id == conversation_id,
        ChatParticipant.role == ParticipantRole.agent,
        ChatParticipant.user_id == admin_user.id,
    ))

    if not agent:
        # اگر ادمین هنوز accept نکرده، پیام نباید بده
        raise ValueError("Admin is not assigned to this conversation")

    msg = ChatMessage(
        conversation_id=conversation_id,
        sender_participant_id=agent.id,
        body=body,
        created_at=datetime.utcnow(),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return {
        "id": msg.id,
        "conversation_id": msg.conversation_id,
        "body": msg.body,
        "created_at": msg.created_at,
        "sender_participant_id": msg.sender_participant_id,
        "sender_role": agent.role,
    }


def admin_accept_conversation_race_safe(
    db: Session,
    *,
    conversation_id: uuid.UUID,
    admin_user: User,
) -> dict | None:
    """
    اگر قبول شد dict برمی‌گرداند، اگر قبلاً قبول شده بود None
    """
    stmt = (
        update(ChatConversation)
        .where(
            ChatConversation.id == conversation_id,
            ChatConversation.assigned_agent_user_id.is_(None),
            ChatConversation.status != ConversationStatus.closed,
        )
        .values(
            assigned_agent_user_id=admin_user.id,
            assigned_at=datetime.utcnow(),
            status=ConversationStatus.in_progress,
        )
        .returning(
            ChatConversation.id,
            ChatConversation.assigned_agent_user_id,
            ChatConversation.status,
            ChatConversation.assigned_at,
        )
    )

    row = db.execute(stmt).first()
    if not row:
        return None

    agent_p = db.scalar(select(ChatParticipant).where(
        ChatParticipant.conversation_id == conversation_id,
        ChatParticipant.role == ParticipantRole.agent,
    ))
    if not agent_p:
        agent_p = ChatParticipant(
            conversation_id=conversation_id,
            role=ParticipantRole.agent,
            user_id=admin_user.id,
            guest_id=None,
            display_name=admin_user.email,
            contact_email=admin_user.email,
            created_at=datetime.utcnow(),
        )
        db.add(agent_p)

    db.commit()
    return {
        "conversation_id": row.id,
        "assigned_agent_user_id": row.assigned_agent_user_id,
        "status": row.status,
        "assigned_at": row.assigned_at,
    }


def admin_close_conversation(db: Session, *, conversation_id: uuid.UUID) -> bool:
    conv = db.get(ChatConversation, conversation_id)
    if not conv:
        return False
    conv.status = ConversationStatus.closed
    db.commit()
    return True


def admin_list_conversations(
    db: Session,
    *,
    status_filter: str | None,
    only_unassigned: bool,
    limit: int,
    offset: int,
):
    latest_message_subq = (
        select(
            ChatMessage.conversation_id,
            func.max(ChatMessage.created_at).label("max_created_at"),
        )
        .group_by(ChatMessage.conversation_id)
        .subquery()
    )

    latest_message_alias = aliased(ChatMessage)

    customer_alias = aliased(ChatParticipant)

    q = (
        select(
            ChatConversation,
            latest_message_alias,
            customer_alias,
        )
        .outerjoin(
            latest_message_subq,
            latest_message_subq.c.conversation_id == ChatConversation.id,
        )
        .outerjoin(
            latest_message_alias,
            and_(
                latest_message_alias.conversation_id == ChatConversation.id,
                latest_message_alias.created_at == latest_message_subq.c.max_created_at,
            ),
        )
        .outerjoin(
            customer_alias,
            and_(
                customer_alias.conversation_id == ChatConversation.id,
                customer_alias.role == ParticipantRole.customer,
            ),
        )
    )

    count_q = select(func.count()).select_from(ChatConversation)

    conds = []
    if status_filter:
        conds.append(ChatConversation.status == status_filter)
    if only_unassigned:
        conds.append(ChatConversation.assigned_agent_user_id.is_(None))

    if conds:
        q = q.where(and_(*conds))
        count_q = count_q.where(and_(*conds))

    total = db.scalar(count_q) or 0

    rows = db.execute(
        q.order_by(ChatConversation.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()

    items = []

    for conv, last_msg, customer in rows:
        items.append({
            "id": conv.id,
            "status": conv.status,
            "label": conv.label,
            "assigned_agent_user_id": conv.assigned_agent_user_id,
            "created_at": conv.created_at,

            "last_message": {
                "id": last_msg.id,
                "body": last_msg.body,
                "created_at": last_msg.created_at,
            } if last_msg else None,

            "customer_email": customer.contact_email if customer else None,
            "customer_display_name": customer.display_name if customer else None,
        })

    return {"items": items, "total": total}


def create_rating_once(db: Session, *, conversation_id: uuid.UUID, stars: int) -> ChatRating:
    conv = db.get(ChatConversation, conversation_id)
    if not conv:
        raise ValueError("Conversation not found")
    if not conv.assigned_agent_user_id:
        raise ValueError("Conversation has no assigned agent")

    existing = db.scalar(select(ChatRating).where(ChatRating.conversation_id == conversation_id))
    if existing:
        raise ValueError("Rating already exists")

    rating = ChatRating(
        conversation_id=conversation_id,
        agent_user_id=conv.assigned_agent_user_id,
        stars=stars,
        created_at=datetime.utcnow(),
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)
    return rating
