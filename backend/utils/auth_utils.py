import os
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

from fastapi import Depends, HTTPException, Request, Response, status
from jose import ExpiredSignatureError, JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

import models
from database import SessionLocal

# Configure bcrypt hashing through passlib.
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

# Read auth settings from environment with backward-compatible fallbacks.
SECRET_KEY = os.getenv('SECRET_KEY') or os.getenv('JWT_SECRET_KEY', 'change_me_in_local_env')
ALGORITHM = os.getenv('ALGORITHM') or os.getenv('JWT_ALGORITHM', 'HS256')


def _parse_positive_int(value: str, default: int) -> int:
    # Parse positive integer values from env safely.
    try:
        parsed = int(value)
        return parsed if parsed > 0 else default
    except ValueError:
        return default


def _parse_samesite(value: str) -> Literal['lax', 'strict', 'none']:
    # Restrict cookie SameSite value to valid Starlette literals.
    normalized = value.strip().lower()
    if normalized == 'strict':
        return 'strict'
    if normalized == 'none':
        return 'none'
    return 'lax'


ACCESS_TOKEN_EXPIRE_MINUTES = _parse_positive_int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '60'), 60)

COOKIE_NAME = os.getenv('SESSION_COOKIE_NAME', 'careeros_session')

# Production detection: when ENVIRONMENT=production (set on Render),
# cookies MUST use Secure=True + SameSite=None because the frontend
# (Vercel) and backend (Render) live on different domains.
# Without this, the browser silently drops the cookie on cross-origin
# requests, making login succeed but all protected routes inaccessible.
_is_production = os.getenv('ENVIRONMENT', 'development').strip().lower() == 'production'

# Allow explicit overrides via env vars, but default based on environment.
COOKIE_SECURE = (
    os.getenv('SESSION_COOKIE_SECURE', '').strip().lower() in {'1', 'true', 'yes', 'on'}
    if os.getenv('SESSION_COOKIE_SECURE')
    else _is_production
)
COOKIE_SAMESITE: Literal['lax', 'strict', 'none'] = (
    _parse_samesite(os.getenv('SESSION_COOKIE_SAMESITE', ''))
    if os.getenv('SESSION_COOKIE_SAMESITE')
    else ('none' if _is_production else 'lax')
)
COOKIE_MAX_AGE = ACCESS_TOKEN_EXPIRE_MINUTES * 60


def get_db():
    # Provide a scoped SQLAlchemy session per request.
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    # Hash plain passwords before persistence.
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Compare a plain password to a stored hash.
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict[str, Any]) -> str:
    # Create a signed JWT that expires using ACCESS_TOKEN_EXPIRE_MINUTES.
    to_encode: dict[str, Any] = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({'exp': expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def set_auth_cookie(response: Response, token: str) -> None:
    # Persist access token in a secure httpOnly cookie for browser sessions.
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path='/',
    )


def clear_auth_cookie(response: Response) -> None:
    # Remove the auth cookie to terminate browser session state.
    response.delete_cookie(
        key=COOKIE_NAME,
        path='/',
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
    )


def get_token_from_request(request: Request) -> str:
    # Prefer Authorization header, then fall back to secure session cookie.
    authorization = request.headers.get('Authorization')
    if authorization:
        scheme, _, credentials = authorization.partition(' ')
        if scheme.strip().lower() == 'bearer' and credentials:
            return credentials.strip()

    cookie_token = request.cookies.get(COOKIE_NAME)
    if cookie_token:
        return cookie_token

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Not authenticated',
        headers={'WWW-Authenticate': 'Bearer'},
    )


def verify_token(token: str) -> int:
    # Decode and validate JWT; return user_id from subject claim.
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get('sub')
        if user_id is None:
            raise credentials_exception
        return int(user_id)
    except ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Token expired',
            headers={'WWW-Authenticate': 'Bearer'},
        ) from exc
    except (JWTError, ValueError) as exc:
        raise credentials_exception from exc


def get_current_user(
    token: str = Depends(get_token_from_request),
    db: Session = Depends(get_db),
) -> models.User:
    # Resolve user from bearer token for protected routes.
    user_id = verify_token(token)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='User not found',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    return user