# Running PocketSmart AI (Production-Like Local Run)

This guide describes how to run the full, unified PocketSmart AI application locally using FastAPI to serve both the REST API endpoints and the built frontend Single-Page Application (SPA) on a single port.

---

## 1. Prerequisites

- **Python 3.11+** installed
- **Node.js 18+** & **npm** installed
- A valid **Google Gemini API Key** (set in `backend/.env`)

---

## 2. Step-by-Step Setup

### Step 1: Build the Frontend

Compile the React frontend into static assets in `dist/`:

```powershell
# From the project root (e:\NM_project\pocketsmart-ai)
npm install
npm run build
```

This generates `dist/index.html` and `dist/assets/*`.

---

### Step 2: Configure Backend Environment

Navigate into `backend/` and verify `backend/.env` exists with required configuration:

```env
GOOGLE_API_KEY="your_actual_gemini_api_key"
GEMINI_MODEL="gemini-2.5-flash"
SECRET_KEY="supersecretkeyformultiauthdevelopmentonly1234"
DATABASE_URL="sqlite:///./pocketsmart.db"
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS="http://localhost:8000,http://127.0.0.1:8000"
MAX_UPLOAD_MB=5
COOKIE_SECURE=false
RATE_LIMIT_ENABLED=true
```

---

### Step 3: Run Database Migrations

Apply database migrations to create SQLite/Postgres tables:

```powershell
cd backend
$env:PYTHONPATH="."
.\venv\Scripts\python.exe -m alembic upgrade head
```

---

### Step 4: Start the Unified FastAPI Server

Start Uvicorn to serve the API, static assets, and SPA fallback:

```powershell
# From backend directory
$env:PYTHONPATH="."
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

---

### Step 5: Open the Application

Open your browser to:

👉 **[http://localhost:8000](http://localhost:8000)**

---

## 3. Architecture & Routing Summary

| Path / Request | Handled By | Behavior |
|---|---|---|
| `/` | FastAPI SPA Fallback | Serves `dist/index.html` (Landing Page) |
| `/login`, `/register`, `/dashboard`, `/history`, `/planner/*` | FastAPI SPA Fallback | Serves `dist/index.html` (Client-side routing) |
| `/assets/*` | FastAPI `StaticFiles` | Serves compiled JS/CSS bundles from `dist/assets` |
| `/api/auth/*` | FastAPI `auth.router` | Authentication endpoints (JWT httpOnly cookies) |
| `/api/plan/*` | FastAPI `planners.router`| Home, Party, Jewelry budget planning & recalculations |
| `/api/history/*` | FastAPI `history.router` | User plan history & detail views |
| `/api/*` (unmatched) | FastAPI API 404 handler | Returns JSON 404 `{"error": {"code": "NOT_FOUND", ...}}` |
| `/health` | FastAPI health check | Returns `{"status": "ok"}` |
| `/docs` | FastAPI Swagger UI | Interactive OpenAPI documentation |

---

## 4. Running Tests

To run the complete automated test suite:

```powershell
cd backend
$env:PYTHONPATH="."
.\venv\Scripts\python.exe -m pytest
```
