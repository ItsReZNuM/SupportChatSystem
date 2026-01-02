from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import secrets
from app.security.ip_ban import register_failed_attempt
from app.core.db import get_db
from app.models.user import User
from app.core.security import verify_password, create_access_token
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    VerifyOTPRequest,
)
from app.core.redis import get_redis
from app.services.otp_service import (
    create_otp,
    verify_otp,
)
from app.tasks.email_tasks import send_otp_email_task

router = APIRouter(prefix="/auth", tags=["Auth"])


# -------------------------------------------------------------------
# LOGIN (email + password)
# -------------------------------------------------------------------
@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    redis = get_redis()
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(user.password_hash, data.password):
            # ۳. ثبت تلاش ناموفق برای بن پلکانی IP
            register_failed_attempt(redis, request.client.host)
            raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive",
        )

    # 6-digit numeric OTP
    otp_code = f"{secrets.randbelow(1_000_000):06d}"

    # create OTP row + session token in DB
    otp_token = create_otp(
        db=db,
        user_id=user.id,
        code=otp_code,
    )

    # async email (Celery)
    send_otp_email_task.delay(user.email, otp_code)

    return LoginResponse(otp_token=otp_token)


# -------------------------------------------------------------------
# VERIFY OTP (otp_token + code)
# -------------------------------------------------------------------
@router.post("/verify-otp")
def verify_otp_endpoint(data: VerifyOTPRequest, request: Request, db: Session = Depends(get_db)):
    redis = get_redis()
    try:
        otp = verify_otp(db=db, session_token=data.otp_token, code=data.code)
    except ValueError as e:
        if str(e) == "Invalid OTP code":
            register_failed_attempt(redis, request.client.host)
        raise HTTPException(status_code=400, detail=str(e))

    user = otp.user

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive",
        )

    # 🔐 اینجا بعداً JWT / Access Token صادر می‌کنی
    # access_token = create_access_token(user.id)
    access_token = create_access_token(subject=str(user.id))

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }