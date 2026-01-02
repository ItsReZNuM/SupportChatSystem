from datetime import datetime, timedelta
from jose import jwt
from argon2 import PasswordHasher
from app.core.config import settings

ph = PasswordHasher()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES


def hash_password(password: str) -> str:
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    return ph.hash(password)



def verify_password(hashed: str, plain: str) -> bool:
    try:
        return ph.verify(hashed, plain)
    except Exception:
        return False


def hash_value(value: str) -> str:
    return ph.hash(value)


def verify_hash(hashed: str, plain: str) -> bool:
    try:
        return ph.verify(hashed, plain)
    except Exception:
        return False


def create_access_token(subject: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": subject,
        "exp": expire,
    }
    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=ALGORITHM,
    )


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
