from pydantic import BaseModel, EmailStr, field_validator
from app.core.password_policy import validate_password

class CreateAdminRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_policy(cls, v: str):
        return validate_password(v)
