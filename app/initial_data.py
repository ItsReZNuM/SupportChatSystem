from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.core.security import hash_password
from app.core.config import settings


def seed_initial_users(db: Session):
    exists = db.query(User).filter(
        User.role == UserRole.SUPERADMIN
    ).first()
    if exists:
        return

    superadmin = User(
        email=settings.SEED_SUPERADMIN_EMAIL,
        password_hash=hash_password(
            settings.SEED_SUPERADMIN_PASSWORD
        ),
        role=UserRole.SUPERADMIN
    )
    db.add(superadmin)

    if settings.SEED_ADMIN_EMAIL:
        admin = User(
            email=settings.SEED_ADMIN_EMAIL,
            password_hash=hash_password(
                settings.SEED_ADMIN_PASSWORD
            ),
            role=UserRole.ADMIN
        )

        db.add(admin)

    db.commit()
