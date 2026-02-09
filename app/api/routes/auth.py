from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
import secrets
from datetime import datetime, timedelta

from app.security.ip_ban import register_failed_attempt
from app.core.db import get_db
from app.models.user import User
from app.core.security import verify_password, create_access_token
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    VerifyOTPRequest,
    ResendOTPRequest,
)
from app.core.redis import get_redis
from app.services.otp_service import (
    create_otp,
    verify_otp,
    OTP_EXPIRATION_SECONDS,
    _hash_code,
)
from app.tasks.email_tasks import send_otp_email_task
from app.models.otp import OTPCode

router = APIRouter(prefix="/auth", tags=["Auth"])


def _fail(redis, ip: str, status_code: int, detail: str):
    """Register failed attempt and raise HTTP error."""
    register_failed_attempt(redis, ip)
    raise HTTPException(status_code=status_code, detail=detail)


def _rate_limit(redis, key: str, window_seconds: int, max_allowed: int, message: str):
    """
    Simple INCR/EXPIRE rate limit.
    Raises 429 with seconds remaining (TTL) and a custom message.
    """
    count = redis.incr(key)
    if count == 1:
        redis.expire(key, window_seconds)

    if count > max_allowed:
        ttl = redis.ttl(key)
        if ttl is None or ttl < 0:
            ttl = window_seconds

        raise HTTPException(
            status_code=429,
            detail={
                "detail": message,
                "seconds": int(ttl),
            },
        )


# -------------------------------------------------------------------
# LOGIN (email + password)
# -------------------------------------------------------------------
@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    redis = get_redis()
    ip = request.client.host

    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(user.password_hash, data.password):
        _fail(redis, ip, 401, "Invalid credentials")

    if not user.is_active:
        _fail(redis, ip, 403, "User is inactive")

    if not user.is_admin:
        _fail(redis, ip, 403, "You don't have the right to login")

    # ✅ Rate-limit even for admins (prevent OTP spam)
    # 1) per IP + email: 1 request per 60s
    key_ip_email = f"rl:login:otp:{ip}:{data.email.lower()}"
    _rate_limit(
        redis=redis,
        key=key_ip_email,
        window_seconds=60,
        max_allowed=1,
        message="You don't have the right to login",  # <- same message style you want
    )

    # 2) per IP: max 10 requests per 10 minutes
    key_ip = f"rl:login:otp:{ip}"
    _rate_limit(
        redis=redis,
        key=key_ip,
        window_seconds=600,
        max_allowed=10,
        message="You don't have the right to login",  # <- same message style you want
    )

    otp_session_id, otp_code = create_otp(db, user.id)
    send_otp_email_task.delay(user.email, otp_code)

    return {
        "message": "Verification code sent",
        "otp_session_id": otp_session_id,
        "expires_in": 600,
    }


# -------------------------------------------------------------------
# VERIFY OTP (otp_session_id + code)
# -------------------------------------------------------------------
@router.post("/verify-otp")
def verify_otp_endpoint(data: VerifyOTPRequest, request: Request, db: Session = Depends(get_db)):
    redis = get_redis()
    ip = request.client.host

    try:
        otp = verify_otp(db, data.otp_session_id, data.code)
    except ValueError as e:
        _fail(redis, ip, 400, str(e))

    user = db.query(User).filter(User.id == otp.user_id).first()
    if not user or not user.is_active:
        _fail(redis, ip, 401, "Invalid token")

    if not user.is_admin:
        _fail(redis, ip, 403, "You don't have the right to login")

    access_token = create_access_token(subject=str(otp.user_id))

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "encrypted": True,
    }
