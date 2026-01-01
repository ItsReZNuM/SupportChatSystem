from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.logging_config import setup_logging
from app.api.routes import auth, users, admins
from app.core.db import Base, engine, SessionLocal
from app.initial_data import seed_initial_users

setup_logging()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Auth MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(admins.router)

@app.on_event("startup")
def startup():
    db = SessionLocal()
    seed_initial_users(db)
    db.close()
