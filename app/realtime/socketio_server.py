import socketio
from app.core.config import settings

# mgr = socketio.AsyncRedisManager("redis://redis:6379/0")

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    # client_manager=mgr,
)

socket_app = socketio.ASGIApp(sio)
