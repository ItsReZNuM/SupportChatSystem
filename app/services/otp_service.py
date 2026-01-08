from datetime import datetime, timedelta
import secrets
from uuid import UUID

from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.core.config import settings
from app.models.otp import OTPCode

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

OTP_EXPIRATION_SECONDS = settings.OTP_TTL_SECONDS
SESSION_TTL = settings.OTP_SESSION_TTL_MINUTES
MAX_ATTEMPTS = 5

RESEND_MAX = 3
RESEND_COOLDOWN_SECONDS = 60


def _hash_code(code: str) -> str:
    return pwd_context.hash(code)


def _verify_code(code: str, hashed: str) -> bool:
    return pwd_context.verify(code, hashed)


def generate_session_token() -> str:
    return f"OTP_{secrets.token_urlsafe(32)}"


def create_otp(db: Session, user_id: UUID):
    session_id = generate_session_token()
    code = f"{secrets.randbelow(1_000_000):06d}"

    now = datetime.utcnow()

    db.query(OTPCode).filter(
        OTPCode.user_id == user_id,
        OTPCode.consumed_at == None
    ).update({"consumed_at": now})

    otp = OTPCode(
        user_id=user_id,
        otp_session_id=session_id,
        code_hash=_hash_code(code),
        expires_at=now + timedelta(seconds=OTP_EXPIRATION_SECONDS),
        session_expires_at=now + timedelta(minutes=SESSION_TTL),
        last_sent_at=now,
        resend_count=0,
    )

    db.add(otp)
    db.commit()

    return session_id, code


def verify_otp(db: Session, otp_session_id: str, code: str) -> OTPCode:
    otp = db.query(OTPCode).filter(
        OTPCode.otp_session_id == otp_session_id,
        OTPCode.consumed_at == None
    ).first()

    if not otp:
        raise ValueError("Invalid or expired session")

    if otp.expires_at < datetime.utcnow():
        raise ValueError("OTP expired")

    if otp.session_expires_at < datetime.utcnow():
        raise ValueError("OTP session expired")

    if otp.expires_at < datetime.utcnow():
        raise ValueError("OTP expired")

    if otp.attempts >= MAX_ATTEMPTS:
        raise ValueError("Too many attempts")

    if not _verify_code(code, otp.code_hash):
        otp.attempts += 1
        db.commit()
        raise ValueError("Invalid OTP")

    otp.consumed_at = datetime.utcnow()
    db.commit()
    return otp


def resend_otp(db: Session, otp_session_id: str) -> str:
    otp = db.query(OTPCode).filter(
        OTPCode.otp_session_id == otp_session_id,
        OTPCode.consumed_at == None
    ).first()

    if not otp:
        raise ValueError("Invalid or expired session")

    if otp.resend_count >= RESEND_MAX:
        raise ValueError("Resend limit exceeded")

    if otp.last_sent_at and (datetime.utcnow() - otp.last_sent_at) < timedelta(seconds=RESEND_COOLDOWN_SECONDS):
        raise ValueError("Please wait 2 minutes before resend")

    if otp.session_expires_at < datetime.utcnow():
        raise ValueError("OTP session expired")

    new_code = f"{secrets.randbelow(1_000_000):06d}"
    otp.code_hash = _hash_code(new_code)
    otp.resend_count += 1
    otp.last_sent_at = datetime.utcnow()
    otp.expires_at = datetime.utcnow() + timedelta(seconds=OTP_EXPIRATION_SECONDS)

    db.commit()
    return new_code
