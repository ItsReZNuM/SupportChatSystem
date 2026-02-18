from pydantic import BaseModel, EmailStr
import uuid

class UserOut(BaseModel):
    id: uuid.UUID 
    email: EmailStr
    is_admin: bool

    class Config:
        from_attributes = True
