from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
import secrets
from app.security.ip_ban import register_failed_attempt
from app.core.db import get_db
from app.models.user import User
from app.core.security import verify_password, create_access_token, create_refresh_token
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
def verify_otp_endpoint(
    data: VerifyOTPRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    redis = get_redis()

    try:
        otp = verify_otp(
            db=db,
            session_token=data.otp_token,
            code=data.code,
        )
    except ValueError:
        register_failed_attempt(redis, request.client.host)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP",
        )

    user = otp.user

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive",
        )

    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(data={"sub": str(user.id)})


    # Access Token Cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,    
        samesite="lax",
        max_age=60 * 15,
        path="/",
    )

    # Refresh Token Cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
        path="/auth/refresh",
    )

    return {"message": "authenticated"}