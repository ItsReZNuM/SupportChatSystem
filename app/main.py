import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.middleware.ip_ban import ip_ban_middleware
from app.api.routes import auth, users
from app.core.db import Base, engine, SessionLocal
from app.realtime.socketio_server import socket_app, sio
from app.realtime import chat_events

from app.api.routes.chat_http import router as chat_http_router

app = FastAPI(title="Auth MVP")
app.middleware("http")(ip_ban_middleware)
app.mount("/ws", socket_app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(chat_http_router)

@app.get("/", tags=["Root"])
def start_func():
    return "Welcome To My Project"

app = socketio.ASGIApp(
    sio,
    other_asgi_app=app,
    socketio_path="socket.io",   # پیش‌فرض همینه، ولی صریح نوشتنش خوبه
)


