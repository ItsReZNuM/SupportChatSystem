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

        html_content = f"""
        <!DOCTYPE html>
        <html lang="fa">
        <body style="background-color:#f4f6f8; font-family: Arial, sans-serif;">
            <div style="max-width:480px; margin:40px auto; background:#ffffff; padding:32px; border-radius:12px;">
                <h2 style="text-align:center;">👋 خوش آمدید</h2>
                <p style="text-align:center;">
                    کد تأیید شما:
                </p>
                <div style="
                    text-align:center;
                    font-size:28px;
                    background:#111827;
                    color:#ffffff;
                    padding:16px;
                    border-radius:8px;
                    letter-spacing:6px;
                    margin:24px 0;
                ">
                    {code}
                </div>
                <p style="text-align:center; font-size:13px; color:#6b7280;">
                    این کد تا ۵ دقیقه معتبر است
                </p>
            </div>
        </body>
        </html>
        """

        message = EmailMessage()
        message["To"] = to_email
        message["From"] = settings.GMAIL_SENDER_EMAIL
        message["Subject"] = "کد تأیید ورود"

        # متن ساده (fallback)
        message.set_content(f"کد تأیید شما: {code}")

        # HTML
        message.add_alternative(html_content, subtype="html")

        encoded_message = base64.urlsafe_b64encode(
            message.as_bytes()
        ).decode()

        service.users().messages().send(
            userId="me",
            body={"raw": encoded_message}
        ).execute()

    except Exception:
        raise
