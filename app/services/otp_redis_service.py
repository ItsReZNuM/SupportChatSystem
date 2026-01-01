import secrets
from redis import Redis

from app.core.config import settings
from app.core.security import hash_value, verify_hash


def _k_cooldown(user_id) -> str:
    return f"otp:cooldown:{user_id}"


def _k_code(user_id) -> str:
    return f"otp:code:{user_id}"


def _k_attempts(user_id) -> str:
    return f"otp:attempts:{user_id}"


def request_otp(redis: Redis, user_id) -> tuple[bool, int | None, str | None]:

    cooldown_key = _k_cooldown(user_id)

    ok = redis.set(
        cooldown_key,
        "1",
        ex=settings.OTP_RESEND_INTERVAL_SECONDS,
        nx=True
    )

    if not ok:
        ttl = redis.ttl(cooldown_key)
        remaining = int(ttl) if ttl and ttl > 0 else settings.OTP_RESEND_INTERVAL_SECONDS
        return False, remaining, None

    code = f"{secrets.randbelow(1_000_000):06d}"
    code_hash = hash_value(code)

    redis.set(_k_code(user_id), code_hash, ex=settings.OTP_TTL_SECONDS)
    redis.set(_k_attempts(user_id), "0", ex=settings.OTP_TTL_SECONDS)

    return True, None, code


def verify_otp_redis(redis: Redis, user_id, code: str) -> bool:
    code_hash = redis.get(_k_code(user_id))
    if not code_hash:

        return False

    attempts_raw = redis.get(_k_attempts(user_id)) or "0"
    try:
        attempts = int(attempts_raw)
    except Exception:
        attempts = 0

    if attempts >= settings.OTP_MAX_ATTEMPTS:

        return False

    if not verify_hash(code_hash, code):
        attempts = redis.incr(_k_attempts(user_id))
        ttl = redis.ttl(_k_attempts(user_id))
        if ttl is None or ttl < 0:
            redis.expire(_k_attempts(user_id), settings.OTP_TTL_SECONDS)

        return False

    redis.delete(_k_code(user_id), _k_attempts(user_id))

    return True
