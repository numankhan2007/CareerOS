from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

import models
import schemas
from utils.auth_utils import (
    clear_auth_cookie,
    create_access_token,
    get_current_user,
    get_db,
    hash_password,
    set_auth_cookie,
    verify_password,
)

router = APIRouter()


@router.post('/signup', response_model=schemas.SessionAuthOut, status_code=status.HTTP_201_CREATED)
def signup(
    payload: schemas.UserCreate,
    response: Response,
    db: Session = Depends(get_db),
) -> schemas.SessionAuthOut:
    # Prevent duplicate accounts by email.
    normalized_email = payload.email.strip().lower()
    existing_user = db.query(models.User).filter(models.User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already registered')

    new_user = models.User(
        name=payload.name.strip(),
        email=normalized_email,
        hashed_password=hash_password(payload.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token({'sub': str(new_user.id)})
    set_auth_cookie(response, access_token)
    return schemas.SessionAuthOut(
        message='Signup successful',
        user=schemas.UserOut.model_validate(new_user),
    )


@router.post('/login', response_model=schemas.SessionAuthOut)
def login(
    payload: schemas.UserLogin,
    response: Response,
    db: Session = Depends(get_db),
) -> schemas.SessionAuthOut:
    # Validate credentials and issue JWT.
    normalized_email = payload.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == normalized_email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid email or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    access_token = create_access_token({'sub': str(user.id)})
    set_auth_cookie(response, access_token)
    return schemas.SessionAuthOut(
        message='Login successful',
        user=schemas.UserOut.model_validate(user),
    )


@router.post('/logout', response_model=schemas.MessageOut)
def logout(response: Response) -> schemas.MessageOut:
    # Clear session cookie in browser-based auth flow.
    clear_auth_cookie(response)
    return schemas.MessageOut(message='Logged out')


@router.get('/me', response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)) -> models.User:
    # Return the currently authenticated user.
    return current_user