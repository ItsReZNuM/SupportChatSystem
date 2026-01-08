import uuid
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.db import Base


class OTPCode(Base):
    __tablename__ = "otp_codes"

    id = Column(Integer, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    otp_session_id = Column(String(128), nullable=False, index=True)

    code_hash = Column(String, nullable=False)

    # ⏳ عمر OTP code
    expires_at = Column(DateTime, nullable=False)

    # ⏳ عمر session
    session_expires_at = Column(DateTime, nullable=False)

    attempts = Column(Integer, default=0, nullable=False)
    resend_count = Column(Integer, default=0, nullable=False)

    last_sent_at = Column(DateTime, nullable=True)
    consumed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", lazy="joined")
