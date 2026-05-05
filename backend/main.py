import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from models import Application, Bookmark, Opportunity, User
from routers import applications, auth, opportunities, recommendations, users

# Ensure all SQLAlchemy model classes are imported before metadata creation.
_ = (User, Opportunity, Application, Bookmark)

# Create database tables during early development.
Base.metadata.create_all(bind=engine)

app = FastAPI(title='CareerOS API', version='0.1.0')

# Read allowed frontend origins from environment.
# FRONTEND_ORIGIN  → single production URL set on Render (e.g. https://careeros.vercel.app)
# FRONTEND_ORIGINS → comma-separated list (kept for backward compatibility / local dev)
_origin_single = os.getenv('FRONTEND_ORIGIN', '')
_origin_list = os.getenv('FRONTEND_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')
_raw = f'{_origin_single},{_origin_list}' if _origin_single else _origin_list
allow_origins = [o.strip() for o in _raw.split(',') if o.strip()]

# Allow frontend requests from the Vite development server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/health')
def health_check() -> dict[str, str]:
    # Connectivity endpoint for frontend-backend verification.
    return {'status': 'ok'}


app.include_router(auth.router, prefix='/auth', tags=['Auth'])
app.include_router(users.router, prefix='/users', tags=['Users'])
app.include_router(opportunities.router, prefix='/opportunities', tags=['Opportunities'])
app.include_router(applications.router, prefix='/applications', tags=['Applications'])
app.include_router(recommendations.router, prefix='/recommendations', tags=['Recommendations'])