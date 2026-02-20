import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.middleware.ip_ban import ip_ban_middleware
from app.api.routes import auth, users
from app.api.routes.chat_http import router as chat_http_router
from app.realtime.socketio_server import sio  # همون sio اصلی
import app.realtime.chat_events  # noqa: F401  ← register کردن همه @sio.event ها

fastapi_app = FastAPI(title="Auth MVP")
fastapi_app.middleware("http")(ip_ban_middleware)

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fastapi_app.include_router(auth.router)
fastapi_app.include_router(users.router)
fastapi_app.include_router(chat_http_router)

@fastapi_app.get("/", tags=["Root"])
def start_func():
    return "Welcome To My Project"

app = socketio.ASGIApp(
    sio,
    other_asgi_app=fastapi_app,
    socketio_path="socket.io",
)