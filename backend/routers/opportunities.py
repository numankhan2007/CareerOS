from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

import models
import schemas
from utils.auth_utils import get_current_user, get_db

router = APIRouter()

ALLOWED_TYPES = {'internship', 'hackathon', 'fellowship', 'competition'}


def _normalize_tags(raw_tags: list[str]) -> list[str]:
    # Normalize tag values for consistent storage and filtering.
    normalized: list[str] = []
    seen: set[str] = set()
    for tag in raw_tags:
        cleaned = tag.strip().lower()
        if cleaned and cleaned not in seen:
            normalized.append(cleaned)
            seen.add(cleaned)
    return normalized


def _tags_to_string(raw_tags: list[str]) -> str:
    return ','.join(_normalize_tags(raw_tags))


def _tags_from_string(raw_tags: str | None) -> list[str]:
    if not raw_tags:
        return []
    return [tag for tag in raw_tags.split(',') if tag]


def _serialize_opportunity(
    opportunity: models.Opportunity,
    bookmarked_ids: set[int],
) -> schemas.OpportunityOut:
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


def _matches_tags(opportunity: models.Opportunity, filter_tags: list[str]) -> bool:
    if not filter_tags:
        return True
    opportunity_tags = set(_tags_from_string(opportunity.tags))
    return any(tag in opportunity_tags for tag in filter_tags)


@router.get('', response_model=list[schemas.OpportunityOut])
def list_opportunities(
    opportunity_type: str | None = Query(None, alias='type'),
    search: str | None = None,
    tags: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[schemas.OpportunityOut]:
    query = db.query(models.Opportunity)

    if opportunity_type:
        normalized_type = opportunity_type.strip().lower()
        if normalized_type in ALLOWED_TYPES:
            query = query.filter(models.Opportunity.type == normalized_type)
        else:
            return []

    if search:
        trimmed_search = search.strip()
        if trimmed_search:
            pattern = f"%{trimmed_search}%"
            query = query.filter(
                or_(
                    models.Opportunity.title.ilike(pattern),
                    models.Opportunity.company_or_organizer.ilike(pattern),
                )
            )

    opportunities = query.order_by(models.Opportunity.created_at.desc()).all()
    filter_tags = _normalize_tags(tags.split(',')) if tags else []

    bookmarked_ids = {
        bookmark.opportunity_id
        for bookmark in db.query(models.Bookmark).filter(models.Bookmark.user_id == current_user.id).all()
    }

    return [
        _serialize_opportunity(opportunity, bookmarked_ids)
        for opportunity in opportunities
        if _matches_tags(opportunity, filter_tags)
    ]


@router.get('/bookmarked', response_model=list[schemas.OpportunityOut])
def list_bookmarked_opportunities(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[schemas.OpportunityOut]:
    bookmarks = db.query(models.Bookmark).filter(models.Bookmark.user_id == current_user.id).all()
    bookmarked_ids = {bookmark.opportunity_id for bookmark in bookmarks}

    if not bookmarked_ids:
        return []

    opportunities = (
        db.query(models.Opportunity)
        .filter(models.Opportunity.id.in_(bookmarked_ids))
        .order_by(models.Opportunity.created_at.desc())
        .all()
    )

    return [_serialize_opportunity(opportunity, bookmarked_ids) for opportunity in opportunities]


@router.get('/stats')
def opportunity_stats(
    db: Session = Depends(get_db),
) -> dict[str, object]:
    """Public aggregate stats for all opportunities — no auth required."""
    opportunities = db.query(models.Opportunity).all()

    # Count by type.
    type_counts: dict[str, int] = {t: 0 for t in ALLOWED_TYPES}
    tag_counter: dict[str, int] = {}

    for opp in opportunities:
        opp_type = opp.type.strip().lower() if opp.type else ''
        if opp_type in type_counts:
            type_counts[opp_type] += 1

        for tag in _tags_from_string(opp.tags):
            cleaned = tag.strip().lower()
            if cleaned:
                tag_counter[cleaned] = tag_counter.get(cleaned, 0) + 1

    # Top 8 most popular tags, sorted by count descending.
    sorted_tags = sorted(tag_counter.items(), key=lambda pair: pair[1], reverse=True)[:8]
    most_popular_tags = [{'tag': tag, 'count': count} for tag, count in sorted_tags]

    return {
        'total': len(opportunities),
        'by_type': type_counts,
        'most_popular_tags': most_popular_tags,
    }


@router.get('/{opportunity_id}', response_model=schemas.OpportunityOut)
def get_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.OpportunityOut:
    opportunity = db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Opportunity not found')

    bookmark = (
        db.query(models.Bookmark)
        .filter(
            models.Bookmark.user_id == current_user.id,
            models.Bookmark.opportunity_id == opportunity_id,
        )
        .first()
    )
    bookmarked_ids = {opportunity_id} if bookmark else set()
    return _serialize_opportunity(opportunity, bookmarked_ids)


@router.post('', response_model=schemas.OpportunityOut, status_code=status.HTTP_201_CREATED)
def create_opportunity(
    payload: schemas.OpportunityCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.OpportunityOut:
    normalized_type = payload.type.strip().lower()
    if normalized_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid opportunity type')

    new_opportunity = models.Opportunity(
        title=payload.title.strip(),
        company_or_organizer=payload.company_or_organizer.strip(),
        type=normalized_type,
        description=payload.description.strip(),
        tags=_tags_to_string(payload.tags),
        application_link=payload.application_link,
    )
    db.add(new_opportunity)
    db.commit()
    db.refresh(new_opportunity)

    return _serialize_opportunity(new_opportunity, bookmarked_ids=set())


@router.post('/{opportunity_id}/bookmark')
def toggle_bookmark(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> dict[str, bool]:
    opportunity = db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Opportunity not found')

    bookmark = (
        db.query(models.Bookmark)
        .filter(
            models.Bookmark.user_id == current_user.id,
            models.Bookmark.opportunity_id == opportunity_id,
        )
        .first()
    )

    if bookmark:
        db.delete(bookmark)
        db.commit()
        return {'bookmarked': False}

    new_bookmark = models.Bookmark(user_id=current_user.id, opportunity_id=opportunity_id)
    db.add(new_bookmark)
    db.commit()
    return {'bookmarked': True}
