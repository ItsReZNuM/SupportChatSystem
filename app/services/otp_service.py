import logging
import secrets
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.otp import OTPCode
from app.core.security import hash_value, verify_hash

auth_logger = logging.getLogger("auth")

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

    auth_logger.info(
        "OTP generated | user_id=%s | expires_in=%s_seconds",
        user_id, OTP_EXPIRE_MINUTES * 60
    )

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
        auth_logger.warning(
            "OTP verify failed | user_id=%s | reason=not_found",
            user_id
        )
        return False

    if otp.attempts >= MAX_ATTEMPTS:
        auth_logger.warning(
            "OTP blocked | user_id=%s | reason=max_attempts",
            user_id
        )
        return False

    if not verify_hash(otp.code_hash, code):
        otp.attempts += 1
        db.commit()
        auth_logger.warning(
            "OTP verify failed | user_id=%s | reason=wrong_code | attempts=%s",
            user_id, otp.attempts
        )
        return False

    otp.consumed_at = datetime.utcnow()
    db.commit()

    auth_logger.info(
        "OTP consumed | user_id=%s",
        user_id
    )
    return True
