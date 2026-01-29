from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.schemas.admin import CreateAdminRequest  

router = APIRouter(prefix="/setup", tags=["Setup – One-time"])

@router.post("/create-first-superadmin", status_code=201)
def create_first_superadmin(
    data: CreateAdminRequest,
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.role == UserRole.SUPERADMIN).first()
    if existing:
        raise HTTPException(
            status_code=403,
            detail="Superadmin already exists. This endpoint is disabled."
        )

    superadmin = User(
        email=data.email.strip().lower(),
        password_hash=hash_password(data.password),
        role=UserRole.SUPERADMIN,
        is_active=True
    )

    db.add(superadmin)
    db.commit()
    db.refresh(superadmin)

    return {
        "message": "First superadmin created successfully",
        "email": superadmin.email
    }