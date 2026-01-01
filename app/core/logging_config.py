import logging
from logging.handlers import TimedRotatingFileHandler
from pathlib import Path

from app.core.config import settings


LOG_DIR = Path(settings.LOG_DIR)
LOG_DIR.mkdir(exist_ok=True)


LOG_FORMAT = (
    "%(asctime)s | %(levelname)s | "
    "%(name)s | %(message)s"
)

DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def _file_handler(filename: str, level: int):
    handler = TimedRotatingFileHandler(
        LOG_DIR / filename,
        when="midnight",
        backupCount=14,
        encoding="utf-8",
    )
    handler.setLevel(level)
    handler.setFormatter(
        logging.Formatter(LOG_FORMAT, DATE_FORMAT)
    )
    return handler


def setup_logging():
    logging.getLogger().handlers.clear()

    logging.getLogger().setLevel(
        getattr(logging, settings.LOG_LEVEL.upper())
    )

    app_handler = _file_handler(
        "app.log", logging.INFO
    )

    auth_handler = _file_handler(
        "auth.log", logging.INFO
    )

    error_handler = _file_handler(
        "error.log", logging.ERROR
    )

    logging.getLogger().addHandler(app_handler)
    logging.getLogger().addHandler(error_handler)

    auth_logger = logging.getLogger("auth")
    auth_logger.setLevel(logging.INFO)
    auth_logger.addHandler(auth_handler)
    auth_logger.propagate = False
