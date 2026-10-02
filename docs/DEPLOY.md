# PocketSmart AI — Render Deployment Guide (No Docker)

This guide provides step-by-step instructions for deploying **PocketSmart AI** to [Render](https://render.com) using native runtimes (Python 3.11 + pre-built React frontend) connected to a managed **Render PostgreSQL** database.

---

## 1. Architecture Overview

- **Web Service**: A single Render Web Service running FastAPI (`uvicorn app.main:app`), which both powers the JSON API (`/api/*`) and serves the compiled React single-page application (`dist/`) with SPA fallback for client-side routing.
- **Database**: Managed Render PostgreSQL database (`pocketsmart-db`).
- **Migrations**: Automated pre-deploy migration execution via `alembic upgrade head`.
- **Health Check**: Automated uptime and container health probe at `/health`.

---

## 2. Environment Variables Specification

Configure the following environment variables in the Render Dashboard (**Dashboard > Your Web Service > Environment**):

| Variable Name | Required | Secret? | Default / Example Value | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GOOGLE_API_KEY` | **Yes** | 🔒 **YES** | `AIzaSy...` | Your Google Gemini API key. Never commit this to Git. |
| `SECRET_KEY` | **Yes** | 🔒 **YES** | `(64-char hex string)` | JWT signing key. Must be at least 32 characters in production. |
| `DATABASE_URL` | **Yes** | 🔒 **YES** | `postgres://user:pass@host/db` | Internal connection string from your Render PostgreSQL database. |
| `GEMINI_MODEL` | No | No | `gemini-2.5-flash` | The Gemini model name to use for recommendations. |
| `COOKIE_SECURE` | **Yes** | No | `true` | Enforces `Secure; HttpOnly; SameSite=Lax` cookies for HTTPS. |
| `ALLOWED_ORIGINS` | No | No | `https://pocketsmart-ai.onrender.com` | Allowed CORS origins (only needed if frontend is hosted on separate domain). |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | No | `30` | JWT cookie expiration time in minutes. |
| `MAX_UPLOAD_MB` | No | No | `5` | Maximum outfit image upload size in MB. |
| `RATE_LIMIT_ENABLED` | No | No | `true` | Enables in-memory sliding window rate limiting. |
| `PYTHON_VERSION` | No | No | `3.11.10` | Pinned Python runtime version (also set in `.python-version`). |

### How to Generate a Secure `SECRET_KEY`
Run this one-liner in your terminal to generate a cryptographically secure 64-character secret key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## 3. Deployment Method A: Blueprint (`render.yaml`)

The repository includes a ready-to-use [`render.yaml`](file:///e:/NM_project/pocketsmart-ai/render.yaml) blueprint.

1. **Push your code to GitHub / GitLab**. Ensure `dist/` is compiled:
   ```bash
   npm run build
   git add .
   git commit -m "Prepare production build"
   git push origin main
   ```
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint**.
4. Connect your Git repository.
5. Render will detect `render.yaml` and configure:
   - PostgreSQL Database: `pocketsmart-db`
   - Web Service: `pocketsmart-ai`
6. Under **Environment Variables**, provide your `GOOGLE_API_KEY`. (Render will automatically generate `SECRET_KEY` and link `DATABASE_URL`).
7. Click **Apply**.

---

## 4. Deployment Method B: Manual Dashboard Setup (Click-by-Click)

### Step 1: Create PostgreSQL Database
1. In the Render Dashboard, click **New +** > **PostgreSQL**.
2. Name: `pocketsmart-db`
3. Database: `pocketsmart`
4. User: `pocketsmart`
5. Region: Select the region closest to your target users (e.g., *Singapore* or *Frankfurt*).
6. Plan: **Free** (or Starter for permanent production data without 30-day inactivity expiration).
7. Click **Create Database**.
8. Wait for the database status to turn **Available**, then copy the **Internal Database URL** (e.g., `postgres://pocketsmart:...@dpg-...-a/pocketsmart`).

### Step 2: Create Web Service
1. Click **New +** > **Web Service**.
2. Connect your repository.
3. Configure the service settings:
   - **Name**: `pocketsmart-ai`
   - **Region**: Same region as your database.
   - **Branch**: `main`
   - **Root Directory**: `.` *(leave empty / root)*
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     ./render-build.sh
     ```
     *(Or if you prefer standard pip: `pip install -r backend/requirements.txt`)*
   - **Pre-deploy Command**:
     ```bash
     cd backend && alembic upgrade head
     ```
   - **Start Command**:
     ```bash
     cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
4. Scroll down to **Advanced**:
   - **Health Check Path**: `/health`
   - **Auto-Deploy**: `Yes`
5. Click **Add Environment Variable** and enter the variables from Section 2:
   - Paste the **Internal Database URL** into `DATABASE_URL`.
   - Set `COOKIE_SECURE` to `true`.
   - Set your `SECRET_KEY` (generated with `python -c "import secrets; print(secrets.token_hex(32))"`).
   - Set your `GOOGLE_API_KEY`.
6. Click **Create Web Service**.

---

## 5. Pre-Deployment Release Checklist

Before launching to users, verify the following:

- [ ] **Frontend Built**: Run `npm run build` locally to verify `dist/index.html` and `dist/assets/` compile with 0 TypeScript or bundler errors.
- [ ] **Zero Leaked Secrets**: Verified that `dist/` contains zero instances of `AIza`, `GEMINI`, or `GOOGLE_API_KEY`.
- [ ] **Database Migrations Tested**: Run `alembic upgrade head` on a test instance to ensure all tables (`users`, `plans`) create cleanly.
- [ ] **Production Guardrails Active**:
  - `COOKIE_SECURE=true` refuses startup if `SECRET_KEY` is missing or shorter than 32 characters.
  - Proxy header handling (`ProxyHeadersMiddleware`) is enabled to respect `X-Forwarded-Proto`.
  - Rate limiting is active on `/api/auth/*` and `/api/plan/*`.
- [ ] **Health Endpoint Responding**: Verify `GET /health` returns `{"status":"ok"}` with HTTP 200.

---

## 6. Post-Deployment Verification (Smoke Test)

1. Open your live service URL: `https://pocketsmart-ai.onrender.com`.
2. Register a test account: `user@example.com` / `Password123!`.
3. Check browser devtools: confirm cookie `access_token` has flags `Secure; HttpOnly; SameSite=Lax`.
4. Generate a **Home Plan**, change an item tier, and confirm dynamic price and chart recalculation.
5. Navigate to `/history` and verify the created plan is saved.
6. Log out and confirm that visiting `/dashboard` redirects back to `/login`.

---

## 7. Rollback Procedures

### Scenario A: Roll Back a Bad Web Service Deploy
If a newly deployed commit introduces application errors:
1. Go to **Render Dashboard** > Select `pocketsmart-ai` Web Service.
2. In the left navigation, click **Events** or **Deploys**.
3. Locate the previous working deploy.
4. Click the three dots (`...`) next to that deploy and select **Rollback to this deploy**.
5. Render will immediately serve the previous working build container without rebuilding.

### Scenario B: Roll Back a Database Migration
If an Alembic migration fails or requires reversal:
1. In the Render Dashboard, open the **Shell** tab for `pocketsmart-ai`.
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Check current migration state:
   ```bash
   alembic current
   ```
4. Roll back the most recent migration:
   ```bash
   alembic downgrade -1
   ```
   Or roll back to a specific revision ID:
   ```bash
   alembic downgrade <revision_id>
   ```
5. Verify tables using Python or psql:
   ```bash
   python -c "from app.db.session import engine; print(engine.table_names())"
   ```
