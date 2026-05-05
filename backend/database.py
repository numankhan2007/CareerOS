import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load values from .env before reading DATABASE_URL.
load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost/careeros')

# Engine manages DB connections; SessionLocal creates per-request sessions.
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class inherited by all SQLAlchemy models.
Base = declarative_base()