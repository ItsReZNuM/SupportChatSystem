from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    email: EmailStr

    class Config:
        from_attributes = True
