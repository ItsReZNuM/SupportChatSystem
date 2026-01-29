
import argparse
import getpass
import sys
from colorama import Fore


def main() -> int:
    parser = argparse.ArgumentParser(description="Hash a password using app.core.security.hash_password")
    parser.add_argument("--password", help="Plain password (unsafe to pass via shell history)")
    args = parser.parse_args()

    try:
        from app.core.security import hash_password
    except Exception as e:
        print("ERROR: Could not import app.core.security.hash_password", file=sys.stderr)
        print("Make sure you run this from project root and your venv is active.", file=sys.stderr)
        print(f"Details: {e}", file=sys.stderr)
        return 2

    password = args.password
    if not password:
        password = getpass.getpass("Password: ")
        password2 = getpass.getpass("Repeat password: ")
        if password != password2:
            print("ERROR: Passwords do not match.", file=sys.stderr)
            return 3

    hashed = hash_password(password)
    print(f"{Fore.RED}{hashed}{Fore.RESET}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
