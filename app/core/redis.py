# app/core/redis.py
from __future__ import annotations

import os
from typing import Optional
import redis
import socketio
try:
    from app.core.config import settings  
except Exception:  
    settings = None  


def _get_env(name: str, default: Optional[str] = None) -> Optional[str]:
    v = os.getenv(name)
    return v if v is not None and v != "" else default


def get_redis_url() -> str:
    """
    اولویت:
      1) REDIS_URL
      2) REDIS_HOST/REDIS_PORT/REDIS_DB
    """
    if settings is not None and getattr(settings, "REDIS_URL", None):
        return str(settings.REDIS_URL)

    url = _get_env("REDIS_URL")
    if url:
        return url

    host = _get_env("REDIS_HOST", "localhost")
    port = _get_env("REDIS_PORT", "6379")
    db = _get_env("REDIS_DB", "0")
    return f"redis://{host}:{port}/{db}"

def get_redis():
    return redis_client


REDIS_URL: str = get_redis_url()

redis_client: redis.Redis = redis.Redis.from_url(
    REDIS_URL,
    decode_responses=True,
)

socketio_manager: socketio.AsyncRedisManager = socketio.AsyncRedisManager(REDIS_URL)
