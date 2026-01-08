from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
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
    ResendOTPRequest,
)
from app.core.redis import get_redis
from app.services.otp_service import (
    create_otp,
    verify_otp,
)
from app.tasks.email_tasks import send_otp_email_task
from datetime import datetime, timedelta
from app.models.otp import OTPCode
from app.services.otp_service import OTP_EXPIRATION_SECONDS, _hash_code

router = APIRouter(prefix="/auth", tags=["Auth"])


# -------------------------------------------------------------------
# LOGIN (email + password)
# -------------------------------------------------------------------
@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    redis = get_redis()
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(user.password_hash, data.password):
        register_failed_attempt(redis, request.client.host)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive")

    otp_session_id, otp_code = create_otp(db, user.id)
    send_otp_email_task.delay(user.email, otp_code)

    return {
    "message": "Verification code sent",
    "otp_session_id": otp_session_id,
    "expires_in": 600
    }

# -------------------------------------------------------------------
# VERIFY OTP (otp_token + code)
# -------------------------------------------------------------------
@router.post("/verify-otp")
def verify_otp_endpoint(data: VerifyOTPRequest, request: Request, db: Session = Depends(get_db)):
    redis = get_redis()

    try:
        otp = verify_otp(db, data.otp_session_id, data.code)
    except ValueError as e:
        register_failed_attempt(redis, request.client.host)
        raise HTTPException(status_code=400, detail=str(e))

    access_token = create_access_token(subject=str(otp.user_id))

    return {
    "access_token": access_token,
    "token_type": "bearer",
    "encrypted": True
    }

@router.post("/resend-otp")
def resend_otp(data: ResendOTPRequest, db: Session = Depends(get_db)):
    otp = db.query(OTPCode).filter(
        OTPCode.otp_session_id == data.otp_session_id,
        OTPCode.consumed_at == None
    ).first()

    if not otp:
        raise HTTPException(400, "Invalid session")

    if otp.resend_count >= 3:
        raise HTTPException(429, "Resend limit exceeded")

    if datetime.utcnow() - otp.last_sent_at < timedelta(seconds=60):
        raise HTTPException(429, "Please wait before resend")

    new_code = f"{secrets.randbelow(1_000_000):06d}"

    otp.code_hash = _hash_code(new_code)
    otp.resend_count += 1
    otp.last_sent_at = datetime.utcnow()
    otp.expires_at = datetime.utcnow() + timedelta(seconds=OTP_EXPIRATION_SECONDS)

    db.commit()

    send_otp_email_task.delay(otp.user.email, new_code)
    return {"message": "OTP resent"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/",
    )

    return {"message": "logged out successfully"}
