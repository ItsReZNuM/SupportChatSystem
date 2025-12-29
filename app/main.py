from fastapi import FastAPI
from app.api.routes import auth, users, admins
from app.core.db import Base, engine, SessionLocal
from app.initial_data import seed_initial_users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Auth MVP")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(admins.router)


@app.on_event("startup")
def startup():
    db = SessionLocal()
    seed_initial_users(db)
    db.close()
