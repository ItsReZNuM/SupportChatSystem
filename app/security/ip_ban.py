from datetime import timedelta
from redis import Redis

# ban durations in seconds
BAN_STEPS = [
    5 * 60,        # 5 min
    15 * 60,       # 15 min
    30 * 60,       # 30 min
    60 * 60,       # 1 hour
    6 * 60 * 60,   # 6 hours
    24 * 60 * 60,  # 24 hours
    7 * 24 * 60 * 60,   # 1 week
    30 * 24 * 60 * 60,  # 1 month
]

MAX_FAILS = 5


def _fail_key(ip: str) -> str:
    return f"ip:fail:{ip}"


def _ban_key(ip: str) -> str:
    return f"ip:ban:{ip}"


def _ban_level_key(ip: str) -> str:
    return f"ip:ban:level:{ip}"


def is_ip_banned(redis: Redis, ip: str) -> int | None:

    if redis.exists(_ban_key(ip)):
        ttl = redis.ttl(_ban_key(ip))
        return int(ttl) if ttl and ttl > 0 else None
    return None


def register_failed_attempt(redis: Redis, ip: str) -> int | None:

    fails = redis.incr(_fail_key(ip))

    redis.expire(_fail_key(ip), 24 * 60 * 60)

    if fails < MAX_FAILS:
        return None

    level = redis.incr(_ban_level_key(ip)) - 1
    redis.expire(_ban_level_key(ip), 30 * 24 * 60 * 60)

    duration = BAN_STEPS[min(level, len(BAN_STEPS) - 1)]

    redis.set(_ban_key(ip), "1", ex=duration)
    redis.delete(_fail_key(ip))

    return duration
