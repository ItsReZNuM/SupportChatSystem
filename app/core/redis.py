import redis
from redis import Redis
from app.core.config import settings

_redis: Redis | None = None
REDIS_URL = getattr(settings, "REDIS_URL", "redis://localhost:6379/0")

redis_client = redis.Redis.from_url(
    REDIS_URL,
    decode_responses=True,
)

def get_redis() -> Redis:
    global _redis
    if _redis is None:
        _redis = Redis.from_url(
            settings.REDIS_URL,
            decode_responses=True, 
        )
    return _redis
