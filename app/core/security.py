import logging
from datetime import datetime, timedelta
from jose import jwt
from argon2 import PasswordHasher
from app.core.config import settings

logger = logging.getLogger("auth")

ph = PasswordHasher()
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return ph.hash(password)


def verify_password(hashed: str, plain: str) -> bool:
    try:
        return ph.verify(hashed, plain)
    except Exception:
        logger.debug("Password verification failed")
        return False


def hash_value(value: str) -> str:
    return ph.hash(value)


def verify_hash(hashed: str, plain: str) -> bool:
    try:
        return ph.verify(hashed, plain)
    except Exception:
        return False


def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    data.update({"exp": expire})
    token = jwt.encode(
        data,
        settings.SECRET_KEY,
        algorithm=ALGORITHM
    )
    logger.info(
        "Access token created | user_id=%s",
        data.get("sub")
    )
    return token


def create_refresh_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    data.update({"exp": expire, "type": "refresh"})
    return jwt.encode(
        data,
        settings.SECRET_KEY,
        algorithm=ALGORITHM
    )
