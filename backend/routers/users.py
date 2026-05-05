from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

import models
import schemas
from utils.auth_utils import (
    clear_auth_cookie,
    get_current_user,
    get_db,
    hash_password,
    verify_password,
)

router = APIRouter()


@router.get('/ping')
def users_ping() -> dict[str, str]:
    # Placeholder endpoint confirms users router wiring.
    return {'message': 'Users router ready'}


@router.get('/me/stats', response_model=schemas.UserStats)
def user_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.UserStats:
    """Return aggregate counts for the current user's profile header."""
    total_applications = (
        db.query(models.Application)
        .filter(models.Application.user_id == current_user.id)
        .count()
    )

    selected_count = (
        db.query(models.Application)
        .filter(
            models.Application.user_id == current_user.id,
            models.Application.status == models.ApplicationStatus.SELECTED,
        )
        .count()
    )

    bookmarks_count = (
        db.query(models.Bookmark)
        .filter(models.Bookmark.user_id == current_user.id)
        .count()
    )

    return schemas.UserStats(
        total_applications=total_applications,
        selected_count=selected_count,
        bookmarks_count=bookmarks_count,
        member_since=current_user.created_at,
    )


@router.patch('/me', response_model=schemas.UserOut)
def update_profile(
    payload: schemas.ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.UserOut:
    """Partially update the authenticated user's profile fields."""
    fields_set = payload.model_fields_set

    if 'name' in fields_set and payload.name is not None:
        trimmed_name = payload.name.strip()
        if len(trimmed_name) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Name must be at least 2 characters',
            )
        current_user.name = trimmed_name

    if 'skills' in fields_set:
        current_user.skills = payload.skills

    if 'resume_link' in fields_set:
        current_user.resume_link = payload.resume_link

    db.commit()
    db.refresh(current_user)

    return schemas.UserOut.model_validate(current_user)


@router.post('/me/password', response_model=schemas.MessageOut)
def change_password(
    payload: schemas.PasswordChange,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.MessageOut:
    """Change password after verifying the current one."""
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Current password is incorrect',
        )

    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()

    return schemas.MessageOut(message='Password updated successfully')


@router.delete('/me', status_code=status.HTTP_200_OK, response_model=schemas.MessageOut)
def delete_account(
    response: Response,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.MessageOut:
    """Permanently delete user account and all related data."""
    # Cascade-safe: explicitly delete children first, then the user row.
    db.query(models.Application).filter(models.Application.user_id == current_user.id).delete()
    db.query(models.Bookmark).filter(models.Bookmark.user_id == current_user.id).delete()
    db.delete(current_user)
    db.commit()

    # Clear session cookie so browser forgets the now-invalid token.
    clear_auth_cookie(response)

    return schemas.MessageOut(message='Account deleted')