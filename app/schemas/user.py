from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


class UserOut(BaseModel):
    email: EmailStr
    role: UserRole

    class Config:
        from_attributes = True
