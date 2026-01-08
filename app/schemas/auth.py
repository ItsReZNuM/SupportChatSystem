from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    message: str
    otp_session_id: str


class VerifyOTPRequest(BaseModel):
    otp_session_id: str
    code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ResendOTPRequest(BaseModel):
    otp_session_id: str