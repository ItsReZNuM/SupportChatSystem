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

from app.core.redis import get_redis
from app.services.otp_redis_service import request_otp, verify_otp_redis
from app.tasks.email_tasks import send_otp_email_task

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(user.password_hash, data.password):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    redis = get_redis()
    allowed, remaining, code = request_otp(redis, user.id)

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {remaining} seconds"
        )

    send_otp_email_task.delay(user.email, code)

    return {"message": "Verification code sent"}


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp_endpoint(
    data: VerifyOTPRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:

        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    redis = get_redis()
    ok = verify_otp_redis(redis, user.id, data.code)

    if not ok:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired code"
        )

    access = create_access_token({"sub": str(user.id), "role": user.role})
    refresh = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(access_token=access, refresh_token=refresh)
