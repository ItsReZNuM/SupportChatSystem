import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_superadmin
from app.core.db import get_db
from app.core.security import hash_password
from app.schemas.admin import CreateAdminRequest
from app.models.user import User, UserRole

logger = logging.getLogger("auth")
router = APIRouter(prefix="/admins", tags=["admins"])


@router.post("")
def create_admin(
    data: CreateAdminRequest,
    db: Session = Depends(get_db),
    superadmin=Depends(require_superadmin)
):
    admin = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role=UserRole.ADMIN
    )
    db.add(admin)
    db.commit()

    logger.info(
        "Admin created | email=%s | by_superadmin=%s",
        data.email, superadmin.id
    )

    return {"message": "Admin created"}
