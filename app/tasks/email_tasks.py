from celery.utils.log import get_task_logger

from app.tasks.celery_app import celery
from app.services.gmail_service import send_otp_email

task_logger = get_task_logger(__name__)


@celery.task(
    name="send_otp_email_task",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    retry_kwargs={"max_retries": 5},
)
def send_otp_email_task(to_email: str, code: str):

    send_otp_email(to_email, code)
