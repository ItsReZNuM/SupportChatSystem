import secrets
from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.core.config import settings
from app.models.otp import OTPCode

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

OTP_EXPIRATION_SECONDS = settings.OTP_TTL_SECONDS
MAX_ATTEMPTS = 5


def _hash_code(code: str) -> str:
    return pwd_context.hash(code)


def _verify_code(code: str, hashed: str) -> bool:
    return pwd_context.verify(code, hashed)


def generate_session_token() -> str:
    return f"OTP_{secrets.token_urlsafe(32)}"


def create_otp(db: Session, user_id, code: str) -> str:
    # ۱. ابطال تمام کدهای قبلی این کاربر قبل از ساخت کد جدید
    db.query(OTPCode).filter(
        OTPCode.user_id == user_id,
        OTPCode.consumed_at == None
    ).update({"consumed_at": datetime.utcnow()})
    
    session_token = generate_session_token()

    otp = OTPCode(
        user_id=user_id,
        session_token=session_token,
        code_hash=_hash_code(code),
        expires_at=datetime.utcnow() + timedelta(seconds=OTP_EXPIRATION_SECONDS),
    )
    db.add(otp)
    db.commit()
    db.refresh(otp)
    return session_token


def verify_otp(db: Session, session_token: str, code: str) -> OTPCode:
    otp = (
        db.query(OTPCode)
        .filter(OTPCode.session_token == session_token)
        .first()
    )

    if not otp:
        raise ValueError("Invalid OTP token")

    if otp.consumed_at:
        raise ValueError("OTP already used")

    if otp.expires_at < datetime.utcnow():
        raise ValueError("OTP expired")

    if otp.attempts >= MAX_ATTEMPTS:
        raise ValueError("Too many attempts")

    if not _verify_code(code, otp.code_hash):
        otp.attempts += 1
        db.commit()
        raise ValueError("Invalid OTP code")

    otp.consumed_at = datetime.utcnow()
    db.commit()

    return otp
