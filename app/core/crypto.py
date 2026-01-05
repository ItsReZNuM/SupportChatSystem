from cryptography.fernet import Fernet
from app.core.config import settings

fernet = Fernet(settings.FERNET_SECRET.encode())

def encrypt(data: str) -> str:
    return fernet.encrypt(data.encode()).decode()

def decrypt(data: str) -> str:
    return fernet.decrypt(data.encode()).decode()
