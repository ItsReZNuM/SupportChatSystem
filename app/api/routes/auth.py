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
from app.services.otp_service import (
    generate_and_store_otp,
    verify_otp,
)
from app.services.gmail_service import send_otp_email

router = APIRouter(prefix="/auth", tags=["auth"])


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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
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
        raise HTTPException(status_code=401)

    if not verify_otp(db, user.id, data.code):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired code"
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
