from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Auth MVP"
    ENV: str = "development"

    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str
    POSTGRES_PORT: int

    GMAIL_CLIENT_ID: str
    GMAIL_CLIENT_SECRET: str
    GMAIL_SENDER_EMAIL: str
    OTP_RESEND_INTERVAL_MINUTES: int = 2

    LOG_LEVEL: str = "INFO"
    LOG_DIR: str = "logs"

    REDIS_URL: str = "redis://localhost:6379/0"

    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    OTP_RESEND_INTERVAL_SECONDS: int = 120
    OTP_TTL_SECONDS: int = 120
    OTP_MAX_ATTEMPTS: int = 5

    OTP_SESSION_TTL_MINUTES:int = 10

    class Config:
        env_file = ".env"


settings = Settings()
