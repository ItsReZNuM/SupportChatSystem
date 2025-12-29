import re

PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$"
)

def validate_password(password: str) -> str:
    if not PASSWORD_REGEX.match(password):
        raise ValueError(
            "Password must be at least 6 characters long and include "
            "uppercase, lowercase, and a special character."
        )
    return password
