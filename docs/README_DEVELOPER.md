# PocketSmart AI: Developer Guide

> Everything a developer needs to **design, build, run and deploy** PocketSmart AI: backend, frontend, database, AI layer, UI design system, build order and deployment (no Docker).

---

## Contents

1. [Product in one page](#1-product-in-one-page)
2. [Tech stack](#2-tech-stack)
3. [System architecture](#3-system-architecture)
4. [Project structure](#4-project-structure)
5. [Backend design](#5-backend-design)
6. [AI layer (Gemini)](#6-ai-layer-gemini)
7. [Budget Engine](#7-budget-engine)
8. [Database design](#8-database-design)
9. [Frontend design](#9-frontend-design)
10. [UI design system](#10-ui-design-system)
11. [How to build it (step by step)](#11-how-to-build-it-step-by-step)
12. [Local setup](#12-local-setup)
13. [Testing](#13-testing)
14. [Deployment (no Docker)](#14-deployment-no-docker)
15. [Security checklist](#15-security-checklist)
16. [Conventions and Definition of Done](#16-conventions-and-definition-of-done)

---

## 1. Product in one page

**What:** a GenAI web app that converts *budget + context* into a verified, platform-linked plan.

| Planner | Inputs | Output |
|---|---|---|
| 🏠 Home | Budget, rooms, counts (lights, fans, furniture, dining tables), notes | Items per category with price, qty, tier, links |
| 🎉 Party | Budget, guests, event type, venue type, needs, notes | Venue / catering / decor / entertainment / contingency split, per-guest cost, checklist |
| 💍 Jewelry | Budget, occasion, style, optional outfit image | Outfit analysis, jewelry picks, match score, styling tips |

**Golden rules (never break these):**
1. **Gemini suggests, Python calculates.** The AI never produces totals.
2. **A plan never exceeds the budget.** If it cannot fit, return a clear error with the minimum needed.
3. **Every price is an estimate** and is labelled as such. No scraping, no fake "live" data.
4. **₹ (INR) everywhere.** Money is stored as integer rupees.
5. **Secrets only in environment variables.**

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Language | Python 3.11+ | Team skill, Gemini SDK support |
| Web framework | **FastAPI** + Uvicorn | Async, auto OpenAPI docs, Pydantic validation |
| Templates | **Jinja2** | Server-rendered pages, minimal JS |
| Frontend | HTML5, CSS3 (custom), vanilla JS (ES modules) | Light, no build step |
| Charts | Chart.js (CDN) | Donut and bar charts |
| AI | **Google Gemini** via `google-genai` SDK | Text + image (multimodal), JSON output mode |
| ORM / migrations | **SQLAlchemy 2.x + Alembic** | Portable across SQLite and PostgreSQL |
| Database | SQLite (local), **PostgreSQL** (production) | Zero-setup dev, durable prod |
| Auth | JWT (PyJWT) in httpOnly cookie, bcrypt hashing | Stateless, secure by default |
| Validation | Pydantic v2 | Input and AI-output schemas |
| Image handling | Pillow | Validate type and size, read in memory |
| Testing | pytest, httpx (TestClient) | Unit and API tests |
| Hosting | Render or Railway (native Python, **no Docker**) | Simple Git-push deploys |

### `requirements.txt`
```
fastapi
uvicorn[standard]
sqlalchemy>=2.0
alembic
psycopg[binary]
pydantic>=2.0
pydantic-settings
email-validator
python-multipart
jinja2
pyjwt
bcrypt
google-genai
pillow
pytest
httpx
```

---

## 3. System architecture

```
┌────────────────┐   HTTPS    ┌──────────────────────────────────────────┐
│    Browser     │ ─────────► │              FastAPI app                  │
│ Jinja2 pages   │ ◄───────── │ routes → services → models                │
│ vanilla JS     │   JSON     └───────┬─────────────────────┬────────────┘
└────────────────┘                    │                     │
                              ┌───────▼────────┐    ┌───────▼────────────┐
                              │  Gemini API    │    │ SQLite / PostgreSQL │
                              │ text + image   │    │ users · plans       │
                              └────────────────┘    └─────────────────────┘
```

### Request lifecycle (plan generation)
```
Form submit (JS fetch)
  → auth dependency (JWT cookie)
  → Pydantic input validation
  → prompt builder
  → Gemini call (JSON mode, timeout, 1 retry)
  → Pydantic validation of AI output  ──(invalid twice)──► fallback catalogue
  → Budget Engine (tiers, totals, fit-to-budget)
  → link builder (deep-links)
  → save plan (plans table)
  → JSON response
  → JS renders cards + donut chart
```

---

## 4. Project structure

```
pocketsmart/
├── app/
│   ├── main.py                  # create_app(), middleware, router includes, startup
│   ├── core/
│   │   ├── config.py            # Settings (pydantic-settings, reads .env)
│   │   ├── security.py          # hash/verify password, create/decode JWT
│   │   ├── deps.py              # get_db, get_current_user
│   │   └── errors.py            # custom exceptions + handlers
│   ├── db/
│   │   ├── base.py              # declarative Base
│   │   └── session.py           # engine, SessionLocal
│   ├── models/                  # SQLAlchemy models: user.py, plan.py
│   ├── schemas/                 # Pydantic: auth.py, home.py, party.py, jewelry.py, plan.py
│   ├── routes/
│   │   ├── pages.py             # HTML routes
│   │   ├── auth.py              # register, token, logout, session-info
│   │   ├── planners.py          # /api/plan/*
│   │   └── history.py           # /api/history/*
│   ├── services/
│   │   ├── gemini_client.py     # SDK wrapper
│   │   ├── prompts/             # home.py, party.py, jewelry.py
│   │   ├── budget_engine.py     # ALL arithmetic
│   │   ├── links.py             # platform deep-link builders
│   │   ├── fallbacks.py         # default recommendations
│   │   └── image_utils.py       # validate + prepare outfit image
│   ├── templates/               # base.html, landing.html, login.html, register.html,
│   │                            # dashboard.html, home_planner.html, party_planner.html,
│   │                            # jewelry_planner.html, history.html, plan_detail.html
│   └── static/
│       ├── css/                 # tokens.css, base.css, components.css, pages.css
│       └── js/                  # api.js, forms.js, render.js, charts.js, tiers.js, upload.js
├── migrations/                  # Alembic
├── tests/
├── alembic.ini
├── requirements.txt
├── .env.example
├── .gitignore                   # .env, *.db, __pycache__, venv
└── README_DEVELOPER.md
```

---

## 5. Backend design

### 5.1 Configuration (`core/config.py`)
```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    google_api_key: str
    gemini_model: str                      # no hard-coded model name anywhere
    secret_key: str                        # no default
    access_token_expire_minutes: int = 30
    database_url: str = "sqlite:///./pocketsmart.db"
    allowed_origins: list[str] = ["http://localhost:8000"]
    max_upload_mb: int = 5
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
```

### 5.2 Routes

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/` | no | Landing page |
| GET | `/login`, `/register` | no | Auth pages (redirect to dashboard if logged in) |
| GET | `/dashboard` | yes | Dashboard |
| GET | `/home-planner`, `/party-planner`, `/jewelry-planner` | yes | Planner forms |
| GET | `/history`, `/history/{id}` | yes | History list and plan detail pages |
| POST | `/api/auth/register` | no | Create account |
| POST | `/api/auth/token` | no | Login, sets JWT cookie |
| POST | `/api/auth/logout` | yes | Clears cookie |
| GET | `/api/session-info` | yes | Current user info |
| POST | `/api/plan/home` | yes | Generate home plan (JSON) |
| POST | `/api/plan/party` | yes | Generate party plan (JSON) |
| POST | `/api/plan/jewelry` | yes | Generate jewelry plan (multipart, optional image) |
| POST | `/api/plan/{id}/recalculate` | yes | Change tiers, recompute (no AI call) |
| GET | `/api/history` | yes | List own plans (paginated) |
| GET | `/api/history/{id}` | yes | Full plan JSON (own plans only) |
| GET | `/health` | no | Health check for hosting |

### 5.3 Auth flow
```
register → bcrypt hash → users row
login    → verify → JWT {sub: user_id, exp} → Set-Cookie: access_token (httpOnly, samesite=lax, secure in prod)
request  → get_current_user reads cookie → decodes JWT → loads user → 401 if invalid/expired
logout   → delete cookie
```
Page routes redirect to `/login` on 401, API routes return JSON `401`.

### 5.4 Error format (all APIs)
```json
{ "error": { "code": "BUDGET_TOO_LOW", "message": "Minimum for your must-have items is ₹18,500.", "details": { "minimum": 18500 } } }
```
Codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `NOT_FOUND`, `BUDGET_TOO_LOW`, `AI_UNAVAILABLE`, `IMAGE_INVALID`.

### 5.5 Input rules (examples)

| Field | Rule |
|---|---|
| `total_budget` | integer ₹, 1,000 to 1,00,00,000 |
| `num_guests` | 1 to 1,000 |
| counts (lights, fans, ...) | 0 to 50 |
| `party_type` | enum: birthday, corporate, wedding, anniversary, other |
| image | jpg / png / webp, max 5 MB, verified with Pillow |
| notes | max 500 characters, stripped |

---

## 6. AI layer (Gemini)

### 6.1 Client (`services/gemini_client.py`)
```python
from google import genai
from google.genai import types
from app.core.config import settings

_client = genai.Client(api_key=settings.google_api_key)

def generate_json(prompt: str, image_bytes: bytes | None = None, mime: str | None = None) -> str:
    parts = [prompt]
    if image_bytes:
        parts.append(types.Part.from_bytes(data=image_bytes, mime_type=mime))
    resp = _client.models.generate_content(
        model=settings.gemini_model,
        contents=parts,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.4,
        ),
    )
    return resp.text
```
Wrap with: timeout, one retry on transient errors, error mapping to `AI_UNAVAILABLE`, and logging (never log the key).

### 6.2 Prompt design rules
- State the **market**: India, INR, Indian brands and platforms.
- Ask for **items only**, not totals, allocations or remaining budget.
- Each item must include: `name`, `description`, `category`, `quantity`, `priority` (1 = must-have, 3 = nice-to-have), `tier_prices` (`budget` / `balanced` / `premium` unit price in INR), `reason`, `search_terms`.
- Require **strict JSON** matching the schema. Include a short example in the prompt.
- Pass the user's priorities and notes as data, and never let notes override the output format (prompt-injection hygiene).

### 6.3 Output validation
```python
class AIItem(BaseModel):
    name: str
    description: str
    category: str
    quantity: int = Field(ge=1, le=500)
    priority: int = Field(ge=1, le=3)
    tier_prices: dict[Literal["budget", "balanced", "premium"], int]
    reason: str
    search_terms: str
```
Invalid JSON or schema failure → retry once → **fallback catalogue** (`source_type="demo"`, banner shown in the UI).

### 6.4 Jewelry image analysis
Extra output block: `outfit_analysis { colors[], style, formality }`. The server computes the **style-match score** by comparing each jewelry item's declared colour / metal / style tags against the outfit palette (simple rules, not another AI call).

---

## 7. Budget Engine

All money is **integer rupees**. Lives in `services/budget_engine.py`, has no AI and no I/O, and is the most heavily tested module.

### 7.1 Steps
1. **Category weights** from user priorities (defaults per planner) give each category a *target allocation*.
2. Each item starts at tier `balanced`.
3. Compute `line_total = tier_prices[tier] × quantity`.
4. **Fit to budget** (hard rule, global):
   - downgrade the lowest-priority, most expensive item one tier at a time;
   - if all items are at `budget` tier, drop nice-to-haves (priority 3, then 2);
   - if must-haves alone exceed the budget → raise `BudgetTooLow(minimum=...)`.
5. Compute category totals, `allocated`, `remaining`, `% of budget`.
6. Party only: reserve contingency (5 to 10%) **before** fitting; add per-guest cost.

### 7.2 Core implementation sketch
```python
TIERS = ("budget", "balanced", "premium")

def line_total(i): return i.tier_prices[i.tier] * i.quantity

def fit_to_budget(items, budget):
    warnings = []
    total = lambda: sum(line_total(i) for i in items)

    while total() > budget:                      # 1) downgrade tiers
        down = [i for i in items if TIERS.index(i.tier) > 0]
        if not down: break
        v = max(down, key=lambda i: (i.priority, line_total(i)))
        v.tier = TIERS[TIERS.index(v.tier) - 1]

    while total() > budget:                      # 2) drop nice-to-haves
        drop = [i for i in items if i.priority > 1]
        if not drop: break
        v = max(drop, key=lambda i: (i.priority, line_total(i)))
        items.remove(v)
        warnings.append(f"Removed '{v.name}' to stay within budget.")

    if total() > budget:                         # 3) cannot fit
        raise BudgetTooLow(minimum=total())
    return items, warnings
```

### 7.3 Tier switching
`POST /api/plan/{id}/recalculate` with `{"item_id": "...", "tier": "premium"}`. The server loads the saved plan (it contains every item's `tier_prices`), changes the tier, re-runs the engine and returns the new plan. **No Gemini call**, so it is instant and free. If the change would exceed the budget, it returns `BUDGET_TOO_LOW` and the UI keeps the old tier.

### 7.4 Deep-links (`services/links.py`)
URL-encoded **search URLs** only. Category-to-platform map:

| Category | Platforms |
|---|---|
| lighting, ceiling_fans, furniture, decor | Amazon, Flipkart, IKEA |
| catering, food | Swiggy, Zomato |
| venue | Google Maps / Google, Booking, MakeMyTrip, OYO |
| entertainment | BookMyShow, Amazon |
| jewelry | Amazon, Flipkart, Bluestone, Tanishq, CaratLane, Melorra |
| default | Amazon, Flipkart, Google |

Use `urllib.parse.quote_plus(search_terms)`. Link formats can change on the vendor side, so keep them in one dictionary.

### 7.5 Fallbacks (`services/fallbacks.py`)
A small curated catalogue per planner. It is used only when the AI fails twice, and every item is tagged `source_type="demo"`.

---

## 8. Database design

### 8.1 ERD
```
┌──────────────┐ 1      n ┌──────────────────────────────┐
│    users     │──────────│            plans             │
├──────────────┤          ├──────────────────────────────┤
│ id (PK)      │          │ id (PK, UUID)                │
│ username (U) │          │ user_id (FK → users.id)      │
│ email (U)    │          │ type (home|party|jewelry)    │
│ password_hash│          │ input_json                   │
│ created_at   │          │ result_json                  │
└──────────────┘          │ total_budget  (int ₹)        │
                          │ allocated     (int ₹)        │
                          │ remaining     (int ₹)        │
                          │ has_image     (bool)         │
                          │ created_at                   │
                          └──────────────────────────────┘
```
Indexes: `users(username)`, `users(email)`, `plans(user_id, created_at DESC)`.

### 8.2 Model sketch
```python
class User(Base):
    __tablename__ = "users"
    id = mapped_column(Integer, primary_key=True)
    username = mapped_column(String(50), unique=True, index=True)
    email = mapped_column(String(255), unique=True, index=True)
    password_hash = mapped_column(String(255))
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

class Plan(Base):
    __tablename__ = "plans"
    id = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id = mapped_column(ForeignKey("users.id"), index=True)
    type = mapped_column(String(10))
    input_json = mapped_column(JSON)
    result_json = mapped_column(JSON)
    total_budget = mapped_column(Integer)
    allocated = mapped_column(Integer)
    remaining = mapped_column(Integer)
    has_image = mapped_column(Boolean, default=False)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
```

### 8.3 Design decisions
- **Uploaded images are not stored.** They are validated, sent to Gemini from memory, and discarded. Only `has_image` and the AI's outfit analysis (inside `result_json`) are saved. This keeps the app stateless, which suits hosts with ephemeral disks.
- `result_json` holds the full plan including every item's `tier_prices`, so recalculation needs no AI.
- Plans are always queried with `WHERE user_id = :current_user`.
- SQLite is for local development only. **Production uses PostgreSQL**, because hosting disks are ephemeral.

### 8.4 Migrations
```
alembic revision --autogenerate -m "init"
alembic upgrade head
```
`DATABASE_URL` comes from env. `env.py` must read it from settings.

---

## 9. Frontend design

### 9.1 Approach
Server-rendered Jinja2 pages with small ES-module scripts. No build step, no framework.

### 9.2 Templates

| Template | Content |
|---|---|
| `base.html` | `<head>`, navbar (logged-in or public variant), flash area, footer, script slots |
| `landing.html` | Hero, planner cards, sample testimonials (labelled "sample"), footer |
| `login.html` / `register.html` | Centered auth card |
| `dashboard.html` | Welcome, 3 planner cards, recent activity (last 3 plans) |
| `home_planner.html` / `party_planner.html` / `jewelry_planner.html` | Sectioned form + results container |
| `history.html` | Card grid of plans |
| `plan_detail.html` | Full plan using the shared renderer |

### 9.3 JavaScript modules (`static/js`)

| Module | Responsibility |
|---|---|
| `api.js` | `fetch` wrapper: JSON and multipart, error parsing, 401 redirect |
| `forms.js` | Client-side validation, submit handling, loading state |
| `render.js` | `renderPlan(plan, container)`: summary bar, category cards, item cards, warnings |
| `charts.js` | Donut chart (allocation by category), health meter |
| `tiers.js` | Tier radio change → call `recalculate` → re-render |
| `upload.js` | Image preview, remove button, type and size check |

**One renderer for everything:** the planner result views and the history detail page both call `renderPlan()` on the same plan JSON, so there is a single place to fix UI bugs.

### 9.4 Page states (design all of them)
Loading skeleton ("Planning your budget..."), empty history, field errors, `BUDGET_TOO_LOW` message with the minimum, AI-fallback banner ("Showing sample suggestions"), image error, session expired.

### 9.5 Responsive rules
- Mobile first. Cards stack in one column below 640 px, 2 columns at 640 px and above, 3 columns at 1024 px and above.
- Forms: single column on mobile. Touch targets at least 44 px.
- Wide tables become card lists on mobile.

### 9.6 Accessibility
Labelled inputs, `aria-live` region for results and errors, visible focus ring, colour contrast of at least 4.5:1, never rely on colour alone (icons plus text for budget status).

---

## 10. UI design system

### 10.1 Tokens (`tokens.css`)
```css
:root {
  --navy-900: #0f2747;
  --blue-600: #3b6ea8;
  --orange-500: #f7941d;
  --bg: #f1f5f9;
  --card: #ffffff;
  --text: #1e293b;
  --muted: #64748b;
  --success: #16a34a;
  --warning: #d97706;
  --danger: #dc2626;
  --radius: 12px;
  --shadow: 0 4px 16px rgba(15, 39, 71, .08);
  --font: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
}
```
Header and hero gradient: `linear-gradient(135deg, var(--blue-600), var(--navy-900))`.

### 10.2 Components

| Component | Notes |
|---|---|
| Navbar | Navy, logo left, links right, active link highlighted |
| Primary button | Blue gradient, white text. Orange for the single main CTA per page |
| Form section card | White, rounded, section icon and title, subtle shadow |
| Input | 44 px height, clear label, error text below in red |
| Summary bar | Total · Allocated · Remaining · health meter |
| Category card | Title, allocation, list of item cards |
| Item card | Name, qty × unit price, line total, **"Estimated" badge**, "Why this pick", tier selector, link chips |
| Link chip | Small pill per platform, opens in a new tab with `rel="noopener"` |
| Budget health meter | Green below 85%, amber 85 to 97%, red above 97% |
| Toast / banner | Success, warning (fallback), error |

### 10.3 Charts
Chart.js donut for category allocation, with the legend below on mobile. Use ₹ formatting through `Intl.NumberFormat('en-IN')`.

### 10.4 Page wireframes
```
LANDING            DASHBOARD                 RESULT
┌───────────────┐  ┌──────────────────────┐  ┌──────────────────────────┐
│ Navbar        │  │ Navbar               │  │ Summary bar + meter      │
│ Hero + CTA    │  │ Welcome, name        │  │ Donut chart              │
│ 3 planner     │  │ [Home][Party][Jewel] │  │ Category card            │
│ cards         │  │ Recent activity      │  │  └ Item card (tiers,     │
│ Testimonials  │  │ [View history]       │  │     why, links)          │
│ Footer        │  │ Footer               │  │ Tips · Warnings · Save   │
└───────────────┘  └──────────────────────┘  └──────────────────────────┘
```

---

## 11. How to build it (step by step)

**Strategy: build one vertical slice first** (Home planner, front to back), then repeat the pattern for Party and Jewelry.

| Step | Task | Done when |
|---|---|---|
| 0 | **Contract (WP0):** freeze Pydantic schemas and the API table in section 5.2 | Schemas committed, everyone agrees |
| 1 | Repo, venv, `requirements.txt`, `.env.example`, `.gitignore`, app skeleton, `/health` | `uvicorn` runs |
| 2 | Config, DB session, models, first Alembic migration | Tables created |
| 3 | Auth: register, login, logout, session-info, `get_current_user` | Login works via `/docs` |
| 4 | Gemini client + smoke script (text, image, JSON mode) | All three succeed |
| 5 | Budget Engine + unit tests | Property test: never exceeds budget |
| 6 | Home prompt, AI validation, fallback, link builder, `/api/plan/home` | Valid plan from curl |
| 7 | Base template, CSS tokens, landing, auth pages, dashboard | Navigation works |
| 8 | Home planner form + `render.js` + chart + tier switching | Full Home flow in browser |
| 9 | Party planner (prompt, endpoint, form, extras) | Full Party flow |
| 10 | Jewelry planner (image upload, analysis, score) | Full Jewelry flow |
| 11 | History list and detail | Past plans reopen identically |
| 12 | Polish: states, responsive, accessibility, error messages | Manual checklist passes |
| 13 | Test pass, bug fixes, README update | CI/tests green |
| 14 | Deploy to Render or Railway | Live URL works end to end |

### Parallel work after Step 0

| Track | Steps |
|---|---|
| AI | 4, prompts for 6, 9, 10 |
| Logic | 5, links, fallbacks, party / jewelry rules |
| Backend | 1 to 3, endpoints, history |
| Frontend | 7 to 12 (use mock JSON from the contract until the API is ready) |

---

## 12. Local setup

```bash
git clone <repo-url> && cd pocketsmart
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env              # then fill in values
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```
Open `http://localhost:8000` and the API docs at `http://localhost:8000/docs`.

### `.env.example`
```
GOOGLE_API_KEY=
GEMINI_MODEL=
SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./pocketsmart.db
ALLOWED_ORIGINS=http://localhost:8000
MAX_UPLOAD_MB=5
```
Generate a secret: `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
Get the Gemini key from Google AI Studio. **Never commit `.env` or paste the key in screenshots, chats or code.**

---

## 13. Testing

| Type | What | Tool |
|---|---|---|
| Unit | Budget Engine (incl. random-input property tests), link builder, schema validation | pytest |
| API | Auth flow, planners with **mocked Gemini**, history access control, recalculate | pytest + TestClient |
| Prompt evaluation | About 10 realistic inputs per planner: JSON validity, budget adherence, platform relevance | Script, run manually |
| Edge cases | Tiny / huge budget, 0 guests, no rooms, bad image, AI timeout, malformed AI JSON | pytest |
| UI | Manual checklist: all pages, all states, mobile and desktop | Browser |

**Key assertions**
- `allocated <= total_budget` for every generated plan.
- A user can never read another user's plan (expect 404).
- No `undefined`, `None` or empty strings reach the UI.

---

## 14. Deployment (no Docker)

Deploy directly on a managed Python host (Render or Railway). The host builds the app from Git, so no container setup is needed.

### 14.1 Render (suggested)
1. Push the repo to GitHub.
2. Create a **PostgreSQL** instance and copy its connection URL.
3. Create a **Web Service** from the repo:

| Setting | Value |
|---|---|
| Runtime | Python 3 |
| Build command | `pip install -r requirements.txt` |
| Pre-deploy / release command | `alembic upgrade head` |
| Start command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health check path | `/health` |

4. Add environment variables: `GOOGLE_API_KEY`, `GEMINI_MODEL`, `SECRET_KEY`, `DATABASE_URL` (from the PostgreSQL instance), `ALLOWED_ORIGINS` (the live URL), `ACCESS_TOKEN_EXPIRE_MINUTES`, `MAX_UPLOAD_MB`.
5. Deploy and open the live URL.

**Railway** works the same way: add a PostgreSQL plugin, set the same variables, build with `pip install -r requirements.txt` and start with the same uvicorn command.

### 14.2 Production notes
- Cookie `secure=True` in production (HTTPS).
- Some hosts give a `postgres://` URL. SQLAlchemy needs `postgresql+psycopg://`, so normalise it in `config.py`.
- Free tiers may sleep when idle. The first request can be slow, so warn demo audiences.
- Disk is ephemeral, which is why images are never stored and PostgreSQL is used.
- Rotate keys after any exposure and keep production and development keys separate.

### 14.3 Release checklist
- [ ] Tests pass
- [ ] Production env variables set, **no secrets in the repo**
- [ ] `alembic upgrade head` ran successfully
- [ ] `/health` returns OK
- [ ] Register, login, all 3 planners, tier switch and history verified on the live URL
- [ ] README updated with the live URL

---

## 15. Security checklist

- [ ] `SECRET_KEY` from env, no default, at least 32 random bytes
- [ ] Passwords hashed with bcrypt, never logged
- [ ] JWT in an httpOnly, SameSite=Lax cookie (`secure` in production)
- [ ] CORS restricted to `ALLOWED_ORIGINS`, never `*` with credentials
- [ ] All plan queries filtered by the current user
- [ ] Uploads: type allow-list, 5 MB limit, verified with Pillow, never saved to disk
- [ ] Notes and inputs length-limited, and AI output rendered as text (escaped), never as raw HTML
- [ ] Basic rate limit on login and plan endpoints (recommended)
- [ ] API key only in env or host secrets, rotated if ever exposed

---

## 16. Conventions and Definition of Done

**Git:** `main` is always deployable. One branch per work package (`feat/wp3-budget-engine`). Pull request and one review before merge. Small, descriptive commits.

**Code:** type hints, Pydantic models at every boundary, no business logic inside route functions (call services), no hard-coded model names, keys or URLs.

**A task is done when:**
- [ ] It meets the acceptance criteria in the project README
- [ ] Tests are added or updated and pass
- [ ] No secrets or debug prints are committed
- [ ] The UI handles loading, error and empty states
- [ ] The relevant docs are updated
