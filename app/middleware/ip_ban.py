from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.redis import get_redis
from app.security.ip_ban import is_ip_banned


async def ip_ban_middleware(request: Request, call_next):
    ip = request.client.host
    redis = get_redis()

    remaining = is_ip_banned(redis, ip)
    if remaining:
        return JSONResponse(
            status_code=403,
            content={
                "detail": f"Your IP is temporarily banned. Try again in {remaining} seconds."
            },
        )

    return await call_next(request)
