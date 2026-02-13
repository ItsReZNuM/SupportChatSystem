from fastapi import HTTPException

def rate_limit(redis, key: str, window_seconds: int, max_allowed: int, message: str):
    count = redis.incr(key)
    if count == 1:
        redis.expire(key, window_seconds)

    if count > max_allowed:
        ttl = redis.ttl(key)
        if ttl is None or ttl < 0:
            ttl = window_seconds
        # برای HTTP
        raise HTTPException(
            status_code=429,
            detail={"detail": message, "seconds": int(ttl)},
        )

def rate_limit_socket(redis, key: str, window: int, max_allowed: int):
    count = redis.incr(key)
    if count == 1:
        redis.expire(key, window)

    if count > max_allowed:
        ttl = redis.ttl(key)
        if ttl is None or ttl < 0:
            ttl = window
        return False, int(ttl)

    return True, 0
