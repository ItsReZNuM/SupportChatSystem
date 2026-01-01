import logging
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
)
from app.schemas.auth import (
    LoginRequest,
    VerifyOTPRequest,
    TokenResponse,
)
from app.models.user import User
from app.models.otp import OTPCode
from app.services.otp_service import (
    generate_and_store_otp,
    verify_otp,
)
from app.services.gmail_service import send_otp_email
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])
auth_logger = logging.getLogger("auth")

OTP_RESEND_INTERVAL_MINUTES = settings.OTP_RESEND_INTERVAL_MINUTES


@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(
        user.password_hash,
        data.password
    ):
        auth_logger.warning(
            "Login failed | email=%s | reason=invalid_credentials",
            data.email
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    auth_logger.info(
        "Login success | user_id=%s | email=%s",
        user.id, user.email
    )

    last_otp = (
        db.query(OTPCode)
        .filter(
            OTPCode.user_id == user.id,
            OTPCode.consumed_at.is_(None)
        )
        .order_by(OTPCode.created_at.desc())
        .first()
    )

    if last_otp:
        wait_until = last_otp.created_at + timedelta(
            minutes=OTP_RESEND_INTERVAL_MINUTES
        )
        if datetime.utcnow() < wait_until:
            remaining = int(
                (wait_until - datetime.utcnow()).total_seconds()
            )
            auth_logger.warning(
                "OTP rate limited | user_id=%s | remaining_seconds=%s",
                user.id, remaining
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {remaining} seconds"
            )

        last_otp.consumed_at = datetime.utcnow()
        db.commit()

    auth_logger.info(
        "OTP requested | user_id=%s",
        user.id
    )

    code = generate_and_store_otp(db, user.id)
    send_otp_email(user.email, code)

    return {"message": "Verification code sent"}


@router.post(
    "/verify-otp",
    response_model=TokenResponse
)
def verify_otp_endpoint(
    data: VerifyOTPRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        auth_logger.warning(
            "OTP verify failed | email=%s | reason=user_not_found",
            data.email
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED
        )

    if not verify_otp(db, user.id, data.code):
        auth_logger.warning(
            "OTP verify failed | user_id=%s | reason=invalid_or_expired",
            user.id
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired code"
        )

    auth_logger.info(
        "OTP verified | user_id=%s",
        user.id
    )

    access = create_access_token(
        {"sub": str(user.id), "role": user.role}
    )
    refresh = create_refresh_token(
        {"sub": str(user.id)}
    )

    return TokenResponse(
        access_token=access,
        refresh_token=refresh
    )
