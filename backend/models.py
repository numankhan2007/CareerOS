import enum
from datetime import datetime

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from database import Base


class ApplicationStatus(str, enum.Enum):
    NOT_APPLIED = 'not_applied'
    APPLIED = 'applied'
    INTERVIEW = 'interview'
    REJECTED = 'rejected'
    SELECTED = 'selected'


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    skills = Column(Text, nullable=True)
    resume_link = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    applications = relationship('Application', back_populates='user', cascade='all, delete-orphan')
    bookmarks = relationship('Bookmark', back_populates='user', cascade='all, delete-orphan')


class Opportunity(Base):
    __tablename__ = 'opportunities'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    company_or_organizer = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    tags = Column(Text, nullable=True)
    application_link = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    applications = relationship('Application', back_populates='opportunity', cascade='all, delete-orphan')
    bookmarks = relationship('Bookmark', back_populates='opportunity', cascade='all, delete-orphan')


class Application(Base):
    __tablename__ = 'applications'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    opportunity_id = Column(Integer, ForeignKey('opportunities.id', ondelete='CASCADE'), nullable=False, index=True)
    status = Column(
        Enum(ApplicationStatus, name='application_status'),
        default=ApplicationStatus.NOT_APPLIED,
        nullable=False,
    )
    notes = Column(Text, nullable=True)
    applied_date = Column(Date, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship('User', back_populates='applications')
    opportunity = relationship('Opportunity', back_populates='applications')


class Bookmark(Base):
    __tablename__ = 'bookmarks'
    __table_args__ = (UniqueConstraint('user_id', 'opportunity_id', name='uq_user_opportunity_bookmark'),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    opportunity_id = Column(Integer, ForeignKey('opportunities.id', ondelete='CASCADE'), nullable=False, index=True)

    user = relationship('User', back_populates='bookmarks')
    opportunity = relationship('Opportunity', back_populates='bookmarks')