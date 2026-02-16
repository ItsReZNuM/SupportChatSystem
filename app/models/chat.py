import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import (
    String, DateTime, Boolean, Text, ForeignKey,
    CheckConstraint, UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum as SAEnum

from app.core.db import Base


class ConversationStatus(str, Enum):
    open = "open"
    in_progress = "in_progress"
    closed = "closed"


class ParticipantRole(str, Enum):
    customer = "customer"
    agent = "agent"


class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    status: Mapped[str] = mapped_column(
        SAEnum(ConversationStatus, name="conversation_status"),
        nullable=False,
        default=ConversationStatus.open,
        index=True,
    )

    label: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    assigned_agent_user_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    assigned_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    participants = relationship("ChatParticipant", back_populates="conversation", cascade="all, delete-orphan")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")
    rating = relationship("ChatRating", back_populates="conversation", uselist=False, cascade="all, delete-orphan")


class ChatParticipant(Base):
    __tablename__ = "chat_participants"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("chat_conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    role: Mapped[str] = mapped_column(
        SAEnum(ParticipantRole, name="participant_role"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    guest_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True),
        nullable=True,
        index=True,
    )

    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    conversation = relationship("ChatConversation", back_populates="participants")
    user = relationship("User")  # optional backref if you want

    __table_args__ = (
        # exactly one of user_id or guest_id must be set
        CheckConstraint(
            "(user_id IS NOT NULL AND guest_id IS NULL) OR (user_id IS NULL AND guest_id IS NOT NULL)",
            name="ck_chat_participants_exactly_one_identity",
        ),
        # prevent multiple same-role participants per conversation (simple and effective)
        UniqueConstraint("conversation_id", "role", name="uq_chat_participants_conversation_role"),
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("chat_conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    sender_participant_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("chat_participants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    conversation = relationship("ChatConversation", back_populates="messages")
    sender = relationship("ChatParticipant")

    guest_display_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    guest_contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    __table_args__ = (
        Index("ix_chat_messages_conversation_created_at", "conversation_id", "created_at"),
    )


class ChatRating(Base):
    __tablename__ = "chat_ratings"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("chat_conversations.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,  # each conversation can have only one rating
        index=True,
    )

    agent_user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    stars: Mapped[int] = mapped_column(nullable=False)  # validate in app (1..5)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    conversation = relationship("ChatConversation", back_populates="rating")
    agent = relationship("User")
