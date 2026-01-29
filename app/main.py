from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.middleware.ip_ban import ip_ban_middleware
from app.api.routes import auth, users, admins, setup
from app.api.routes import auth, users, admins
from app.core.db import Base, engine, SessionLocal

app = FastAPI(title="Auth MVP")
app.middleware("http")(ip_ban_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(admins.router)
app.include_router(setup.router)

@app.get("/", tags=["Root"])
def start_func():
    return "Welcome To My Project"
