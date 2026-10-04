import hashlib
import re
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from config import JWT_EXPIRY_HOURS, JWT_SECRET
from db import get_db

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MIN_PASSWORD_LENGTH = 8
RESET_TOKEN_EXPIRY_MINUTES = 30


class AuthError(Exception):
    pass


def _validate_registration(name: str, email: str, password: str) -> None:
    if not name or not name.strip():
        raise AuthError("Name is required.")
    if not email or not EMAIL_RE.match(email):
        raise AuthError("A valid email is required.")
    if not password or len(password) < MIN_PASSWORD_LENGTH:
        raise AuthError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.")


def _row_to_user(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "created_at": row["created_at"],
    }


def register_user(name: str, email: str, password: str) -> dict:
    email = (email or "").strip().lower()
    _validate_registration(name, email, password)

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    created_at = datetime.now(timezone.utc).isoformat()

    conn = get_db()
    try:
        try:
            cursor = conn.execute(
                "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
                (name.strip(), email, password_hash, created_at),
            )
            conn.commit()
        except sqlite3.IntegrityError as exc:
            raise AuthError("An account with this email already exists.") from exc

        row = conn.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return _row_to_user(row)
    finally:
        conn.close()


def authenticate_user(email: str, password: str) -> dict:
    email = (email or "").strip().lower()

    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    finally:
        conn.close()

    if row is None or not bcrypt.checkpw(
        (password or "").encode("utf-8"), row["password_hash"].encode("utf-8")
    ):
        raise AuthError("Invalid email or password.")

    return _row_to_user(row)


def get_user_by_id(user_id: int) -> dict:
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    finally:
        conn.close()

    if row is None:
        raise AuthError("User not found.")
    return _row_to_user(row)


def generate_token(user: dict) -> str:
    if not JWT_SECRET:
        raise AuthError("JWT_SECRET is not set on the server.")

    payload = {
        "sub": user["id"],
        "email": user["email"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def _hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def request_password_reset(email: str) -> str | None:
    """Create a reset token for the given email, if an account exists.

    Returns the raw token (only ever available here, at creation time) or
    None if there is no account for that email. The caller should always
    respond the same way regardless of which happened, to avoid leaking
    which emails are registered.
    """
    email = (email or "").strip().lower()
    conn = get_db()
    try:
        row = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if row is None:
            return None

        token = secrets.token_urlsafe(32)
        expires_at = (datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRY_MINUTES)).isoformat()
        conn.execute(
            "INSERT INTO password_resets (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)",
            (row["id"], _hash_reset_token(token), expires_at, datetime.now(timezone.utc).isoformat()),
        )
        conn.commit()
        return token
    finally:
        conn.close()


def reset_password(token: str, new_password: str) -> None:
    if not token:
        raise AuthError("Reset token is required.")
    if not new_password or len(new_password) < MIN_PASSWORD_LENGTH:
        raise AuthError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.")

    token_hash = _hash_reset_token(token)
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT * FROM password_resets WHERE token_hash = ? AND used = 0", (token_hash,)
        ).fetchone()
        if row is None:
            raise AuthError("This reset link is invalid or has already been used.")
        if datetime.fromisoformat(row["expires_at"]) < datetime.now(timezone.utc):
            raise AuthError("This reset link has expired. Please request a new one.")

        password_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (password_hash, row["user_id"]))
        conn.execute("UPDATE password_resets SET used = 1 WHERE id = ?", (row["id"],))
        conn.commit()
    finally:
        conn.close()


def decode_token(token: str) -> dict:
    if not JWT_SECRET:
        raise AuthError("JWT_SECRET is not set on the server.")

    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError as exc:
        raise AuthError("Session expired. Please log in again.") from exc
    except jwt.InvalidTokenError as exc:
        raise AuthError("Invalid authentication token.") from exc
