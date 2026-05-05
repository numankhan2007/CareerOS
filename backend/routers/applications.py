from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

import models
import schemas
from utils.auth_utils import get_current_user, get_db

router = APIRouter()

STATUS_ORDER = [
    schemas.StatusEnum.not_applied,
    schemas.StatusEnum.applied,
    schemas.StatusEnum.interview,
    schemas.StatusEnum.rejected,
    schemas.StatusEnum.selected,
]


def _tags_from_string(raw_tags: str | None) -> list[str]:
    """Parse comma-separated tag string stored in the DB into a list."""
    if not raw_tags:
        return []
    return [tag for tag in raw_tags.split(',') if tag]


def _serialize_opportunity(
    opportunity: models.Opportunity,
    bookmarked_ids: set[int],
) -> schemas.OpportunityOut:
    """Convert an ORM Opportunity to its Pydantic representation."""
    return schemas.OpportunityOut(
        id=opportunity.id,
        title=opportunity.title,
        company_or_organizer=opportunity.company_or_organizer,
        type=opportunity.type,
        description=opportunity.description,
        tags=_tags_from_string(opportunity.tags),
        application_link=opportunity.application_link,
        created_at=opportunity.created_at,
        is_bookmarked=opportunity.id in bookmarked_ids,
    )


def _serialize_application(
    application: models.Application,
    bookmarked_ids: set[int],
) -> schemas.ApplicationOut:
    """Convert an ORM Application (with eager-loaded opportunity) to Pydantic."""
    status_value = application.status.value if hasattr(application.status, 'value') else application.status
    return schemas.ApplicationOut(
        id=application.id,
        user_id=application.user_id,
        opportunity_id=application.opportunity_id,
        status=status_value,
        notes=application.notes,
        applied_date=application.applied_date,
        updated_at=application.updated_at,
        opportunity=_serialize_opportunity(application.opportunity, bookmarked_ids),
    )


def _coerce_status(value: schemas.StatusEnum | str) -> models.ApplicationStatus:
    """Map a Pydantic StatusEnum (or raw string) to the SQLAlchemy enum."""
    raw_value = value.value if isinstance(value, schemas.StatusEnum) else value
    try:
        return models.ApplicationStatus(raw_value)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid status') from exc


def _ensure_owner(application: models.Application, current_user: models.User) -> None:
    """Guard — only the owning user may modify their own application."""
    if application.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Not authorized')


def _get_bookmarked_ids(db: Session, user_id: int) -> set[int]:
    """Return the set of opportunity IDs bookmarked by the given user."""
    return {
        bookmark.opportunity_id
        for bookmark in db.query(models.Bookmark).filter(models.Bookmark.user_id == user_id).all()
    }


# ──────────────────────────────────────────────────────────────────────────────
# Routes — /stats is registered BEFORE /{application_id} so FastAPI does not
# interpret "stats" as a path parameter.
# ──────────────────────────────────────────────────────────────────────────────


@router.get('', response_model=dict[str, list[schemas.ApplicationOut]])
def list_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> dict[str, list[schemas.ApplicationOut]]:
    """Return all applications for the current user grouped by status."""
    applications = (
        db.query(models.Application)
        .filter(models.Application.user_id == current_user.id)
        .options(joinedload(models.Application.opportunity))
        .order_by(models.Application.updated_at.desc())
        .all()
    )

    bookmarked_ids = _get_bookmarked_ids(db, current_user.id)

    # Build grouped dict with guaranteed keys for every status.
    grouped: dict[str, list[schemas.ApplicationOut]] = {s.value: [] for s in STATUS_ORDER}
    for application in applications:
        status_key = application.status.value if hasattr(application.status, 'value') else application.status
        grouped[status_key].append(_serialize_application(application, bookmarked_ids))

    return grouped


@router.get('/stats')
def application_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> dict[str, object]:
    """Aggregate stats for the current user's applications."""
    applications = (
        db.query(models.Application)
        .filter(models.Application.user_id == current_user.id)
        .options(joinedload(models.Application.opportunity))
        .order_by(models.Application.updated_at.desc())
        .all()
    )

    bookmarked_ids = _get_bookmarked_ids(db, current_user.id)

    # Count per-status totals — use `s` to avoid shadowing the `status` module.
    by_status = {s.value: 0 for s in STATUS_ORDER}
    for application in applications:
        status_key = application.status.value if hasattr(application.status, 'value') else application.status
        by_status[status_key] += 1

    total = len(applications)
    selected_count = by_status[schemas.StatusEnum.selected.value]
    success_rate = (selected_count / total * 100) if total else 0.0

    recent_activity = [_serialize_application(app, bookmarked_ids) for app in applications[:5]]

    return {
        'total': total,
        'by_status': by_status,
        'recent_activity': recent_activity,
        'success_rate': round(success_rate, 2),
    }


@router.get('/timeline')
def application_timeline(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[dict[str, object]]:
    """Return application counts grouped by week for the last 8 weeks."""
    today = date.today()
    # Monday of the current week.
    current_monday = today - timedelta(days=today.weekday())
    # Start 7 full weeks before the current week (8 weeks total).
    start_date = current_monday - timedelta(weeks=7)

    applications = (
        db.query(models.Application)
        .filter(models.Application.user_id == current_user.id)
        .all()
    )

    # Build 8 weekly buckets keyed by each Monday's date.
    buckets: dict[date, int] = {}
    for week_offset in range(8):
        monday = start_date + timedelta(weeks=week_offset)
        buckets[monday] = 0

    for app in applications:
        # Prefer applied_date (a date); fall back to updated_at (a datetime).
        ref = app.applied_date if app.applied_date else app.updated_at.date()
        if ref < start_date:
            continue
        # Snap to the Monday of the application's week.
        app_monday = ref - timedelta(days=ref.weekday())
        if app_monday in buckets:
            buckets[app_monday] += 1

    # Format each bucket as a short month+day label.
    return [
        {'week': monday.strftime('%b %d'), 'count': count}
        for monday, count in sorted(buckets.items())
    ]


@router.post('', response_model=schemas.ApplicationOut, status_code=status.HTTP_201_CREATED)
def create_application(
    payload: schemas.ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.ApplicationOut:
    """Create a new tracked application — 409 if one already exists for this opportunity."""
    opportunity = db.query(models.Opportunity).filter(models.Opportunity.id == payload.opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Opportunity not found')

    existing = (
        db.query(models.Application)
        .filter(
            models.Application.user_id == current_user.id,
            models.Application.opportunity_id == payload.opportunity_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Application already exists')

    new_application = models.Application(
        user_id=current_user.id,
        opportunity_id=payload.opportunity_id,
        status=_coerce_status(payload.status),
        notes=payload.notes,
        applied_date=payload.applied_date,
    )
    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    bookmarked_ids = _get_bookmarked_ids(db, current_user.id)
    db.refresh(opportunity)
    new_application.opportunity = opportunity

    return _serialize_application(new_application, bookmarked_ids)


@router.patch('/{application_id}', response_model=schemas.ApplicationOut)
def update_application(
    application_id: int,
    payload: schemas.ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.ApplicationOut:
    """Update status, notes, or applied_date — 403 if not the owner."""
    application = (
        db.query(models.Application)
        .filter(models.Application.id == application_id)
        .options(joinedload(models.Application.opportunity))
        .first()
    )
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Application not found')

    _ensure_owner(application, current_user)

    fields_set = payload.model_fields_set

    if 'status' in fields_set:
        if payload.status is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Status cannot be null')
        application.status = _coerce_status(payload.status)
    if 'notes' in fields_set:
        application.notes = payload.notes
    if 'applied_date' in fields_set:
        application.applied_date = payload.applied_date

    db.commit()
    db.refresh(application)

    bookmarked_ids = _get_bookmarked_ids(db, current_user.id)

    return _serialize_application(application, bookmarked_ids)


@router.delete('/{application_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> None:
    """Delete a tracked application — 403 if not the owner."""
    application = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Application not found')

    _ensure_owner(application, current_user)

    db.delete(application)
    db.commit()
    return None
