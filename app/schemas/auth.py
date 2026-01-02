from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    otp_token: str


class VerifyOTPRequest(BaseModel):
    otp_token: str
    code: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
