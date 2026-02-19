import socketio

from app.core.redis import socketio_manager

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    client_manager=socketio_manager, 
)

socket_app = socketio.ASGIApp(sio)
