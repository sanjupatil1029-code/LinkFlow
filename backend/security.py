
import os
from urllib.parse import urlsplit
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from pwdlib import PasswordHash
from jwt.exceptions import InvalidTokenError

load_dotenv()

# Password hashing
password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


# JWT configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)


def create_access_token(data: dict) -> str:
    if not SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY is missing from .env")

    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str):
    if not SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY is missing from .env")

    try:
        return jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
    except InvalidTokenError:
        return None


# Basic blocked-domain check
def is_blocked_url(url: str) -> bool:
    blocked_domains = {
        domain.strip().lower().strip(".")
        for domain in os.getenv("BLOCKED_DOMAINS", "").split(",")
        if domain.strip()
    }

    try:
        hostname = urlsplit(url).hostname

        if not hostname:
            return True

        hostname = hostname.lower().rstrip(".")

        for domain in blocked_domains:
            if hostname == domain or hostname.endswith("." + domain):
                return True

        return False

    except ValueError:
        return True
