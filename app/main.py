from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from app.api.routes import auth, users, admins
from app.core.db import Base, engine, SessionLocal
from app.initial_data import seed_initial_users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Auth MVP")

print("New One Started ...")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://172.19.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(admins.router)

@app.on_event("startup")
def startup():
    db = SessionLocal()
    seed_initial_users(db)
    db.close()

