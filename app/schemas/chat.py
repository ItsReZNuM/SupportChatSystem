from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal, Optional, List

from pydantic import BaseModel, EmailStr, Field


ConversationStatus = Literal["open", "in_progress", "closed"]
ParticipantRole = Literal["customer", "agent"]


class ConversationCreateIn(BaseModel):
    contact_email: EmailStr = None
    label: str = Field(default=None, max_length=100)
    display_name: str = Field(default=None, max_length=120)


class ConversationOut(BaseModel):
    id: uuid.UUID
    status: ConversationStatus
    label: str = None

    assigned_agent_user_id: Optional[uuid.UUID] = None
    assigned_at: Optional[datetime] = None

    created_at: datetime

    guest_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True


class LastMessageOut(BaseModel):
    id: uuid.UUID
    body: str
    created_at: datetime


class ConversationListItem(BaseModel):
    id: uuid.UUID
    status: ConversationStatus
    label: str | None = None

    assigned_agent_user_id: Optional[uuid.UUID] = None
    created_at: datetime

    last_message: Optional[LastMessageOut] = None

    customer_email: Optional[str] = None
    customer_display_name: Optional[str] = None
    customer_id: Optional[uuid.UUID] = None
    
    class Config:
        from_attributes = True

class SimpleChatMessageOut(BaseModel):
    id: uuid.UUID
    sender_id: uuid.UUID
    is_admin: bool
    body: str
    created_at: datetime
    file_url: Optional[str] = None 
    
class ConversationMetaOut(BaseModel):
    id: uuid.UUID
    label: Optional[str] = None
    status: Optional[str] = None  
    guest_email: Optional[EmailStr] = None
    guest_display_name: Optional[str] = None

class SimpleChatThreadOut(BaseModel):
    conversation: ConversationMetaOut
    items: List[SimpleChatMessageOut]
    total: int

class PaginatedConversations(BaseModel):
    items: List[ConversationListItem]
    total: int


class MessageCreateIn(BaseModel):
    body: str = Field(min_length=1, max_length=4000)


class MessageOut(BaseModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    body: str
    created_at: datetime

    sender_participant_id: uuid.UUID
    sender_role: ParticipantRole
    guest_display_name: Optional[str] = None
    guest_contact_email: Optional[EmailStr] = None
    
    class Config:
        from_attributes = True


class PaginatedMessages(BaseModel):
    items: List[MessageOut]
    total: int


class AdminAcceptOut(BaseModel):
    conversation_id: uuid.UUID
    assigned_agent_user_id: uuid.UUID
    status: ConversationStatus
    assigned_at: datetime


class RatingCreateIn(BaseModel):
    stars: int = Field(ge=1, le=5)


class RatingOut(BaseModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    agent_user_id: uuid.UUID
    stars: int
    created_at: datetime

    class Config:
        from_attributes = True
