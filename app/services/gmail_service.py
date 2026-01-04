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
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@600;800&family=Inter:wght@400;600&display=swap" rel="stylesheet">
            <style>
                body {{
                    background-color: #f4f7f9;
                    margin: 0;
                    padding: 0;
                    font-family: 'Inter', -apple-system, system-ui, sans-serif;
                    color: #374151;
                }}
                .wrapper {{
                    padding: 40px 20px;
                }}
                .container {{
                    max-width: 420px;
                    margin: 0 auto;
                    background: #ffffff;
                    padding: 48px 32px;
                    border-radius: 24px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
                    text-align: center;
                }}
                h2 {{
                    color: #111827;
                    font-size: 22px;
                    font-weight: 600;
                    margin: 0 0 12px 0;
                }}
                p {{
                    font-size: 15px;
                    line-height: 1.6;
                    color: #6b7280;
                    margin: 0;
                }}
                .code-container {{
                    margin: 32px 0;
                    padding: 20px;
                    background-color: #f9fafb;
                    border: 1px solid #f3f4f6;
                    border-radius: 16px;
                }}
                .code-text {{
                    font-family: 'JetBrains Mono', 'Courier New', monospace;
                    font-size: 36px;
                    font-weight: 800;
                    color: #111827;
                    letter-spacing: 4px;
                    display: block;
                }}
                .footer-note {{
                    font-size: 13px;
                    color: #9ca3af;
                    margin-top: 24px;
                }}
                .divider {{
                    height: 1px;
                    background-color: #f3f4f6;
                    margin: 32px 0 24px 0;
                }}
                .expiry-tag {{
                    display: inline-block;
                    padding: 4px 12px;
                    background: #fef2f2;
                    color: #ef4444;
                    border-radius: 100px;
                    font-size: 12px;
                    font-weight: 600;
                    margin-top: 8px;
                }}
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <h2>Verify your identity</h2>
                    <p>Use the code below to complete your sign-in. This helps keep your account secure.</p>
                    
                    <div class="code-container">
                        <span class="code-text">{code}</span>
                        <div class="expiry-tag">Expires in 5 minutes</div>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <p class="footer-note">
                        Didn't request this? You can safely ignore this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        message = EmailMessage()
        message["To"] = to_email
        message["From"] = settings.GMAIL_SENDER_EMAIL
        message["Subject"] = "Your Verification Code"

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
