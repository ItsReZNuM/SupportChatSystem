import secrets
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.otp import OTPCode
from app.core.security import hash_value, verify_hash

OTP_EXPIRE_MINUTES = 2
MAX_ATTEMPTS = 5


def generate_and_store_otp(
    db: Session,
    user_id
) -> str:
    code = f"{secrets.randbelow(1_000_000):06d}"

    otp = OTPCode(
        user_id=user_id,
        code_hash=hash_value(code),
        expires_at=datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES)
    )
    db.add(otp)
    db.commit()

    return code


def verify_otp(
    db: Session,
    user_id,
    code: str
) -> bool:
    otp = (
        db.query(OTPCode)
        .filter(
            OTPCode.user_id == user_id,
            OTPCode.consumed_at.is_(None),
            OTPCode.expires_at > datetime.utcnow()
        )
        .order_by(OTPCode.created_at.desc())
        .first()
    )

    if not otp:
        return False

    if otp.attempts >= MAX_ATTEMPTS:
        return False

    if not verify_hash(otp.code_hash, code):
        otp.attempts += 1
        db.commit()
        return False

    otp.consumed_at = datetime.utcnow()
    db.commit()
    return True
