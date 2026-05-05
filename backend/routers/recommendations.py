from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from utils.auth_utils import get_current_user, get_db
from utils.recommendations import _parse_tags, score_opportunity

router = APIRouter()


def _tags_from_string(raw: str | None) -> list[str]:
    """Parse comma-separated tags stored in the DB into a list."""
    if not raw:
        return []
    return [tag for tag in raw.split(',') if tag]


def _build_recommendations(
    db: Session,
    current_user: models.User,
    limit: int = 6,
) -> dict:
    """Core recommendation engine shared by both endpoints."""
    # 1. Parse user skills.
    user_skills = _parse_tags(current_user.skills)

    if not user_skills:
        return {
            'recommendations': [],
            'matched_skills': [],
            'reason': 'no_skills',
        }

    # 2. Fetch all opportunities.
    opportunities = db.query(models.Opportunity).all()

    # 3. Fetch user's applied opportunity IDs + their statuses.
    applications = (
        db.query(models.Application)
        .filter(models.Application.user_id == current_user.id)
        .all()
    )
    applied_ids: dict[int, str] = {}
    for app in applications:
        status_val = app.status.value if hasattr(app.status, 'value') else app.status
        applied_ids[app.opportunity_id] = status_val

    # 4. Fetch user's bookmarked opportunity IDs.
    bookmarked_ids: set[int] = {
        b.opportunity_id
        for b in db.query(models.Bookmark)
        .filter(models.Bookmark.user_id == current_user.id)
        .all()
    }

    # 5. Score each opportunity.
    scored: list[tuple[models.Opportunity, int, list[str]]] = []
    all_matched_skills: set[str] = set()

    for opp in opportunities:
        opp_tags = _parse_tags(opp.tags)
        opp_score = score_opportunity(
            opportunity_tags=opp_tags,
            user_skills=user_skills,
            opportunity_id=opp.id,
            applied_ids=applied_ids,
            bookmarked_ids=bookmarked_ids,
        )

        # Find which user skills matched this opportunity's tags.
        overlap = [skill for skill in user_skills if skill in set(opp_tags)]

        # Exclude low-score opportunities unless bookmarked.
        if opp_score <= 0 and opp.id not in bookmarked_ids:
            continue

        scored.append((opp, opp_score, overlap))
        all_matched_skills.update(overlap)

    # 6. Sort descending by score, take top N.
    scored.sort(key=lambda item: item[1], reverse=True)
    top = scored[:limit]

    if not top:
        return {
            'recommendations': [],
            'matched_skills': sorted(all_matched_skills),
            'reason': 'no_matches',
        }

    # 7. Serialize results.
    results = []
    for opp, opp_score, overlap in top:
        results.append(
            schemas.RecommendationOut(
                id=opp.id,
                title=opp.title,
                company_or_organizer=opp.company_or_organizer,
                type=opp.type,
                description=opp.description,
                tags=_tags_from_string(opp.tags),
                application_link=opp.application_link,
                created_at=opp.created_at,
                is_bookmarked=opp.id in bookmarked_ids,
                score=opp_score,
                matched_skills=overlap,
            )
        )

    return {
        'recommendations': results,
        'matched_skills': sorted(all_matched_skills),
        'reason': 'skills_match',
    }


@router.get('', response_model=schemas.RecommendationsResponse)
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.RecommendationsResponse:
    """Personalized recommendations scored by user-skill ↔ tag overlap."""
    result = _build_recommendations(db, current_user, limit=6)
    return schemas.RecommendationsResponse(**result)


@router.get('/quick', response_model=list[schemas.RecommendationOut])
def get_quick_recommendations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[schemas.RecommendationOut]:
    """Top 3 recommendations — lightweight version for dashboard widget."""
    result = _build_recommendations(db, current_user, limit=3)
    return result['recommendations']
