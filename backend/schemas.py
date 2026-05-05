from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class UserBase(BaseModel):
    # Shared user profile fields.
    name: str
    email: str


class UserCreate(BaseModel):
    # Payload for signup.
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    # Payload for login.
    email: str
    password: str


class UserOut(UserBase):
    # Public user representation returned by protected endpoints.
    id: int
    skills: str | None = None
    resume_link: str | None = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    # JWT response payload.
    access_token: str
    token_type: str


class SessionAuthOut(BaseModel):
    # Auth response payload used by cookie-based session endpoints.
    message: str
    user: UserOut


class MessageOut(BaseModel):
    # Simple message response shape.
    message: str


class ProfileUpdate(BaseModel):
    # Partial update payload for user profile fields.
    name: str | None = None
    skills: str | None = None
    resume_link: str | None = None


class PasswordChange(BaseModel):
    # Payload for authenticated password change.
    current_password: str
    new_password: str = Field(min_length=8)


class UserStats(BaseModel):
    # Aggregate counts displayed on the profile header.
    total_applications: int
    selected_count: int
    bookmarks_count: int
    member_since: datetime


class OpportunityBase(BaseModel):
    title: str
    company_or_organizer: str
    type: str
    description: str
    tags: list[str] = Field(default_factory=list)
    application_link: str | None = None


class OpportunityCreate(BaseModel):
    # Payload for creating opportunities.
    title: str
    company_or_organizer: str
    type: str
    description: str
    tags: list[str]
    application_link: str | None = None


class OpportunityOut(BaseModel):
    id: int
    title: str
    company_or_organizer: str
    type: str
    description: str
    tags: list[str] = Field(default_factory=list)
    application_link: str | None = None
    created_at: datetime
    is_bookmarked: bool = False
    model_config = ConfigDict(from_attributes=True)


class StatusEnum(str, Enum):
    not_applied = 'not_applied'
    applied = 'applied'
    interview = 'interview'
    rejected = 'rejected'
    selected = 'selected'


class ApplicationCreate(BaseModel):
    opportunity_id: int
    status: StatusEnum = StatusEnum.not_applied
    notes: str | None = None
    applied_date: date | None = None


class ApplicationUpdate(BaseModel):
    status: StatusEnum | None = None
    notes: str | None = None
    applied_date: date | None = None


class ApplicationOut(BaseModel):
    id: int
    user_id: int
    opportunity_id: int
    status: StatusEnum
    notes: str | None = None
    applied_date: date | None = None
    updated_at: datetime
    opportunity: OpportunityOut
    model_config = ConfigDict(from_attributes=True)


class BookmarkBase(BaseModel):
    user_id: int
    opportunity_id: int


class BookmarkOut(BookmarkBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class RecommendationOut(OpportunityOut):
    # Extends OpportunityOut with relevance score and which skills matched.
    score: int = 0
    matched_skills: list[str] = Field(default_factory=list)


class RecommendationsResponse(BaseModel):
    # Full recommendations response with metadata for UI reasoning.
    recommendations: list[RecommendationOut] = Field(default_factory=list)
    matched_skills: list[str] = Field(default_factory=list)
    reason: str  # "skills_match" | "no_skills" | "no_matches"