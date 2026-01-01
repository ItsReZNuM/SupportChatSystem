import base64
from email.message import EmailMessage

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from app.core.config import settings

def send_otp_email(to_email: str, code: str):
    try:
        creds = Credentials(
            None,
            refresh_token=settings.GMAIL_REFRESH_TOKEN,
            client_id=settings.GMAIL_CLIENT_ID,
            client_secret=settings.GMAIL_CLIENT_SECRET,
            token_uri="https://oauth2.googleapis.com/token",
            scopes=["https://www.googleapis.com/auth/gmail.send"],
        )

        service = build("gmail", "v1", credentials=creds)

        message = EmailMessage()
        message["To"] = to_email
        message["From"] = settings.GMAIL_SENDER_EMAIL
        message["Subject"] = "Welcome to Our Service - Your OTP Code"
        message.set_content(f"Your verification code is: {code}")

        encoded_message = base64.urlsafe_b64encode(
            message.as_bytes()
        ).decode()

        service.users().messages().send(
            userId="me",
            body={"raw": encoded_message}
        ).execute()


    except Exception as e:
        raise
