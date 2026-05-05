"""Tag-based opportunity scoring for personalized recommendations.

The algorithm is pure Python — no ML libraries needed.  All data is passed
in as arguments so the function can be tested without a database.
"""

from __future__ import annotations


def _parse_tags(raw: str | None) -> list[str]:
    """Split a comma-separated string into lowercase trimmed tokens.

    Never raises — returns an empty list on any parse error.
    """
    try:
        if not raw:
            return []
        return [tag.strip().lower() for tag in raw.split(',') if tag.strip()]
    except Exception:
        return []


def score_opportunity(
    opportunity_tags: list[str],
    user_skills: list[str],
    opportunity_id: int,
    applied_ids: dict[int, str],
    bookmarked_ids: set[int],
) -> int:
    """Compute a relevance score for a single opportunity.

    Scoring rules (additive):
      +3  per tag that also appears in user_skills
      +1  if the opportunity is bookmarked (shows prior interest)
      -5  if the user has already applied
     -10  if the application status is "rejected" or "selected"

    Returns an integer score.  Never raises an exception.
    """
    try:
        score = 0

        # +3 per matching tag.
        user_set = set(user_skills)
        for tag in opportunity_tags:
            if tag in user_set:
                score += 3

        # +1 bookmark bonus.
        if opportunity_id in bookmarked_ids:
            score += 1

        # Deprioritize already-applied opportunities.
        if opportunity_id in applied_ids:
            app_status = applied_ids[opportunity_id]
            if app_status in ('rejected', 'selected'):
                score -= 10  # Strong deprioritize — already resolved.
            else:
                score -= 5  # Mild deprioritize — still in progress.

        return score
    except Exception:
        return 0
