<p align="center">
  <h1 align="center">🚀 CareerOS</h1>
  <p align="center">
    <strong>Your all-in-one career management platform — track applications, discover opportunities, and land your dream role.</strong>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-FF0055?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License" />
</p>

<!-- Add screenshot here -->

---

## ✨ Features

- **🔐 Authentication** — Secure httpOnly cookie sessions with JWT, signup/login/logout, and password management
- **🔍 Explore & Bookmarks** — Browse a curated feed of internships, hackathons, fellowships, and competitions with real-time filtering and bookmarking
- **📋 Application Tracker** — Kanban board with 5-stage pipeline (Not Applied → Applied → Interview → Rejected → Selected), inline status updates, and notes
- **📊 Analytics Dashboard** — Interactive charts (Recharts) showing application timeline, status distribution, opportunity types, and selection rate
- **👤 Profile Management** — Edit name, skills, resume link, change password, and danger zone (account deletion)
- **🎯 Recommendations** — Tag-based recommendation engine that scores and ranks opportunities based on your skill profile
- **🌙 Dark UI** — Premium glassmorphism design with neon accents (blue, purple, cyan) and smooth Framer Motion animations

---

## 🛠 Local Development

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** (local instance or cloud)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL DATABASE_URL and SECRET_KEY

# Seed the database with sample opportunities
python utils/seed.py

# Start the development server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional for local dev)
# Create .env with VITE_API_BASE_URL if not using default localhost:8000

# Start the development server
npm run dev
```

> **Note:** Run both the backend (port 8000) and frontend (port 5173) simultaneously for full functionality.

---

## 🔑 Environment Variables

### Backend

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SECRET_KEY` | ✅ | 64-char hex string for JWT signing. Generate: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM` | ✅ | JWT algorithm (default: `HS256`) |
| `FRONTEND_ORIGIN` | ✅ (prod) | Deployed frontend URL for CORS (e.g. `https://careeros.vercel.app`) |
| `ENVIRONMENT` | ✅ (prod) | Set to `production` on Render for secure cookies |

### Frontend

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ (prod) | Deployed backend URL (e.g. `https://careeros-api.onrender.com`) |

---

## 🚀 Deployment

CareerOS deploys on a free-tier stack:

| Service | Platform | Docs |
|---|---|---|
| Database | [Supabase](https://supabase.com/docs) | Free PostgreSQL with connection pooling |
| Backend | [Render](https://render.com/docs) | Free Python web service with auto-deploy |
| Frontend | [Vercel](https://vercel.com/docs) | Free static/SSR hosting with instant deploys |

### Deployment Sequence

1. **Push to GitHub** — Push the full project to a GitHub repository
2. **Supabase** — Create a project, copy the connection string, run migrations and seed
3. **Render** — Connect repo, set `backend/` as root, configure env vars, deploy
4. **Vercel** — Connect repo, set `frontend/` as root, set Vite preset, configure env vars, deploy
5. **Verify** — Run `python utils/health_check.py` against production DB
6. **Smoke test** — Login → Dashboard flow on live URLs

---

## 📡 API Endpoints

### Auth (`/auth`)

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/signup` | Create account + set session cookie | ❌ |
| `POST` | `/auth/login` | Validate credentials + set session cookie | ❌ |
| `POST` | `/auth/logout` | Clear session cookie | ❌ |
| `GET` | `/auth/me` | Get current authenticated user | ✅ |

### Users (`/users`)

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/users/me/stats` | Profile stats (applications, bookmarks, selected) | ✅ |
| `PATCH` | `/users/me` | Update profile (name, skills, resume link) | ✅ |
| `POST` | `/users/me/password` | Change password | ✅ |
| `DELETE` | `/users/me` | Delete account and all data | ✅ |

### Opportunities (`/opportunities`)

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/opportunities` | List/filter opportunities | ✅ |
| `GET` | `/opportunities/bookmarked` | List bookmarked opportunities | ✅ |
| `GET` | `/opportunities/stats` | Aggregate opportunity stats | ❌ |
| `POST` | `/opportunities/{id}/bookmark` | Toggle bookmark | ✅ |

### Applications (`/applications`)

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/applications` | List applications grouped by status | ✅ |
| `GET` | `/applications/stats` | Application stats + recent activity | ✅ |
| `GET` | `/applications/timeline` | Weekly application counts (8 weeks) | ✅ |
| `POST` | `/applications` | Create tracked application | ✅ |
| `PATCH` | `/applications/{id}` | Update status/notes/date | ✅ |
| `DELETE` | `/applications/{id}` | Delete application | ✅ |

### Recommendations (`/recommendations`)

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/recommendations` | Personalized recommendations (top 6) | ✅ |
| `GET` | `/recommendations/quick` | Dashboard widget (top 3) | ✅ |

---

## 📁 Project Structure

```
CareerOS/
├── backend/
│   ├── main.py                 # FastAPI app, CORS, router registration
│   ├── database.py             # SQLAlchemy engine + session factory
│   ├── models.py               # ORM models (User, Opportunity, Application, Bookmark)
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── requirements.txt        # Python dependencies
│   ├── render.yaml             # Render deployment config
│   ├── .env.production         # Production env template (no secrets)
│   ├── routers/
│   │   ├── auth.py             # Signup, login, logout, /me
│   │   ├── users.py            # Profile CRUD, stats, password, delete
│   │   ├── opportunities.py    # Explore, bookmark, stats, CRUD
│   │   ├── applications.py     # Tracker CRUD, stats, timeline
│   │   └── recommendations.py  # Skill-based recommendation engine
│   └── utils/
│       ├── auth_utils.py       # JWT, bcrypt, cookie helpers
│       ├── recommendations.py  # Scoring algorithm
│       ├── seed.py             # Database seeder (12 opportunities)
│       └── health_check.py     # Pre-deployment verification script
│
├── frontend/
│   ├── vercel.json             # SPA routing rewrites
│   ├── .env.production         # Production API URL
│   └── src/
│       ├── App.jsx             # Route definitions
│       ├── main.jsx            # React entry point
│       ├── index.css           # Global styles + Tailwind directives
│       ├── api/
│       │   ├── axios.js        # Axios client + 401 interceptor
│       │   ├── auth.js         # Auth API calls
│       │   ├── users.js        # User API calls
│       │   ├── opportunities.js # Opportunity API calls
│       │   ├── applications.js # Application API calls
│       │   ├── dashboard.js    # Dashboard API calls
│       │   └── recommendations.js # Recommendation API calls
│       ├── components/
│       │   ├── Sidebar.jsx     # Navigation sidebar
│       │   ├── Toast.jsx       # Toast notifications
│       │   ├── OpportunityCard.jsx
│       │   ├── ApplicationCard.jsx
│       │   ├── ApplicationModal.jsx
│       │   ├── KanbanColumn.jsx
│       │   ├── FilterBar.jsx
│       │   ├── StatusBadge.jsx
│       │   ├── PageTransitionWrapper.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── dashboard/      # StatCard, charts, feeds, widget
│       │   ├── profile/        # ProfileHeader, EditForm, PasswordForm, DangerZone
│       │   └── recommendations/ # RecommendationCard
│       ├── context/
│       │   └── AuthContext.jsx # Global auth state
│       ├── layouts/
│       │   └── AppLayout.jsx  # Sidebar + header + page outlet
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Explore.jsx
│       │   ├── Bookmarks.jsx
│       │   ├── Tracker.jsx
│       │   ├── Profile.jsx
│       │   ├── Recommendations.jsx
│       │   ├── Login.jsx
│       │   └── Signup.jsx
│       └── utils/
│           ├── animations.js   # Shared Framer Motion variants
│           ├── errorHandler.js # Centralized error parsing
│           ├── formatters.js   # Date/status formatting
│           ├── routeConfig.js  # Sidebar route definitions
│           └── validation.js   # Form validation helpers
│
├── README.md
└── LICENSE                     # MIT
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
