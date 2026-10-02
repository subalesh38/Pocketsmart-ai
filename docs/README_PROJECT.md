# PocketSmart AI: Your Smart Budget & Recommendation Assistant

> A GenAI-powered web application that turns a **budget plus context** into a verified, platform-linked plan for **Home Interiors, Parties and Jewelry**.

---

## Prerequisites

Before starting, make sure the following are ready.

| # | Requirement | Details |
|---|---|---|
| 1 | **Python 3.11+** | Install from [python.org](https://www.python.org). Verify with `python --version` |
| 2 | **Python and FastAPI basics** | Routes, Pydantic models, dependencies. See the [FastAPI docs](https://fastapi.tiangolo.com) |
| 3 | **Google AI Studio account and Gemini API key** | Create the key at [aistudio.google.com](https://aistudio.google.com). Store it only in a `.env` file. Never share it in code, screenshots or chats |
| 4 | **Git and GitHub** | Version control. One branch per work package |
| 5 | **Code editor** | VS Code with the Python extension (or any IDE) |
| 6 | **HTML, CSS, JavaScript basics** | For Jinja2 templates and small scripts |
| 7 | **SQL basics** | SQLAlchemy models and Alembic migrations |
| 8 | **Render or Railway account** | For the final deployment (no Docker needed) |

**Libraries used:** FastAPI, Uvicorn, SQLAlchemy, Alembic, Pydantic, Jinja2, PyJWT, bcrypt, google-genai, Pillow, pytest.

**Environment variables:** `GOOGLE_API_KEY`, `GEMINI_MODEL`, `SECRET_KEY`, `DATABASE_URL`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `ALLOWED_ORIGINS`, `MAX_UPLOAD_MB`.

---

## Project Workflow

### The problem
Planning purchases across home decor, parties and jewelry is overwhelming. Prices, platforms and options are scattered, so people overspend or end up with items that do not fit the occasion.

### The solution
PocketSmart AI is a cross-platform, budget-aware recommendation assistant. The user enters a budget and context. Gemini suggests items, and a Python Budget Engine verifies every rupee. The result is a clear plan with allocations, reasons for each pick, and shopping links.

### What the application offers

| Planner | User provides | User receives |
|---|---|---|
| 🏠 **Home Interior** | Budget, rooms, counts of lights, fans, furniture and dining tables, notes | Items per category with price, quantity, tier and links (IKEA, Amazon, Flipkart) |
| 🎉 **Party** | Budget, guest count, event type, venue type, needs, notes | Split across venue, catering, decoration, entertainment and contingency, plus per-guest cost and a checklist |
| 💍 **Jewelry** | Budget, occasion, style, optional outfit image | Outfit analysis (colours, style, formality), jewelry picks, match score and styling tips |

**Shared features:** register / login / logout, dashboard, recommendation history, shopping deep-links, fallback suggestions, and a live deployment.

### How the application works

```
User → Landing → Register / Login → Dashboard
     → Choose planner → Fill form → Validation
     → FastAPI route → Prompt → Gemini (JSON)
     → Output validation (retry, then fallback)
     → Budget Engine (tiers, totals, fit to budget)
     → Shopping links attached → Saved to history
     → Result page: cards, chart, tips
```

**Golden rules**
1. Gemini suggests, **Python calculates**.
2. A plan **never exceeds the budget**. If it cannot fit, the user sees the minimum needed.
3. Every price is an **estimate** and is labelled as one. No scraping.
4. **₹ (INR)** everywhere.
5. Secrets live only in environment variables.

### Our creativity layer

| # | Feature | Scope |
|---|---|---|
| 1 | Verified Budget Engine | v1 |
| 2 | Three tiers per item (Budget / Balanced / Premium) | v1 |
| 3 | "Why this pick" reasoning on every item | v1 |
| 4 | Allocation donut chart and budget health meter | v1 |
| 5 | Priority sliders (must-have vs nice-to-have) | v1 |
| 6 | Honest data labels ("Estimated price", "AI suggestion", "Demo data") | v1 |
| 7 | Outfit colour palette and style-match score | v1 |
| 8 | Party per-guest cost, checklist and timeline | v1 |
| 9 | What-if simulator | Stretch |
| 10 | Print / PDF export | Stretch |
| 11 | Festival and season-aware tips | Stretch |
| 12 | Tamil / Hindi UI | Stretch |

### Epics at a glance

| Epic | Focus | Outcome |
|---|---|---|
| **1** | Gemini AI Initialization | Verified text and image access to Gemini |
| **2** | Core Functionalities Development | Prompts, schemas, budget engine, links, fallbacks |
| **3** | Backend: FastAPI Integration | Routes, auth, database, history |
| **4** | UI Development | All pages, forms, result cards, charts |
| **5** | Testing and Deployment | A tested app live on a public URL |

### Work packages

| WP | Topic | Epic | Depends on | Owner |
|---|---|---|---|---|
| WP0 | Shared contract: schemas and API list | pre-work | none | TBD |
| WP1 | Gemini setup | 1 | WP0 | TBD |
| WP2 | Prompts and AI layer | 2 | WP0, WP1 | TBD |
| WP3 | Budget engine and links | 2 | WP0 | TBD |
| WP4 | Backend and auth | 3 | WP0 | TBD |
| WP5 | Frontend | 4 | WP0 | TBD |
| WP6 | Testing | 5 | WP2 to WP5 | TBD |
| WP7 | Deployment | 5 | all | TBD |

```
WP0 ─► Epic 1 ─► Epic 2 ─┐
                  Epic 3 ─┼─► integration ─► Epic 5 testing ─► deploy
                  Epic 4 ─┘
```
After WP0 fixes the contract, Epics 2, 3 and 4 run in parallel. The frontend uses mock JSON until the API is ready.

---

## Epic 1: Gemini AI Initialization

**Objective:** establish authenticated, reliable access to Gemini for text reasoning, image analysis and structured JSON output.

### Activity 1.1: Set up Google AI Studio and the API key
- Sign in at Google AI Studio and accept the terms.
- Click **Get API key** then **Create API key**, and copy it once.
- Save it in `.env` as `GOOGLE_API_KEY`. Add `.env` to `.gitignore`.
- Choose the model in AI Studio and store its name in `GEMINI_MODEL`. The model name is **never hard-coded**, so it can be swapped without code changes.

### Activity 1.2: Configure access
- Install the SDK: `pip install google-genai`.
- Load the key and model name through a `Settings` class (pydantic-settings).
- Set a request timeout and a retry limit.

### Activity 1.3: Validate connectivity
Write a smoke-test script that checks all three modes:
- **Text-only** prompt returns a response.
- **Image + text** prompt returns an outfit description.
- **JSON mode** returns parseable structured output.

### Activity 1.4: Build the client wrapper
`gemini_client.py` exposes one function, `generate_json(prompt, image_bytes=None, mime=None)`, with:
- timeout and one retry on transient errors,
- error mapping to `AI_UNAVAILABLE`,
- logging that never prints the key.

### Deliverables
`gemini_client.py`, smoke-test script, `.env.example`.

### Acceptance criteria
- [ ] Text, image and JSON-mode calls all succeed.
- [ ] The model is changed through the environment only.
- [ ] No key appears in code, logs or screenshots.

---

## Epic 2: Core Functionalities Development

**Objective:** build the intelligence of the app: prompts, validation, budget math, links and fallbacks.

### Activity 2.1: Define schemas (Pydantic)
- Input models for Home, Party and Jewelry (with ranges: budget ₹1,000 to ₹1,00,00,000, guests 1 to 1,000, counts 0 to 50, notes up to 500 characters).
- AI item model: `name`, `description`, `category`, `quantity`, `priority` (1 to 3), `tier_prices` (budget / balanced / premium), `reason`, `search_terms`.
- Plan output model: totals, categories, items, suggestions, warnings.

### Activity 2.2: Write prompt templates
One prompt per planner. Each one:
- sets the market (India, INR, Indian brands and platforms),
- asks for **items only**, never totals or remaining budget,
- requires strict JSON with a short example,
- treats user notes as data, so they cannot change the output format.

### Activity 2.3: Build the Budget Engine
All money is stored as integer rupees. The engine:
1. assigns category targets from the user's priorities,
2. starts every item at the `balanced` tier,
3. computes `line_total = unit_price × quantity`,
4. **fits to budget**: downgrade tiers on the lowest-priority items, then drop nice-to-haves, and raise `BudgetTooLow(minimum)` if the must-haves alone do not fit,
5. computes category totals, allocated, remaining and percentages,
6. for parties, reserves 5 to 10% contingency first and adds per-guest cost.

### Activity 2.4: Build the deep-link generator
URL-encoded search links, mapped by category:

| Category | Platforms |
|---|---|
| Lighting, fans, furniture, decor | Amazon, Flipkart, IKEA |
| Catering | Swiggy, Zomato |
| Venue | Google, Booking, MakeMyTrip, OYO |
| Entertainment | BookMyShow, Amazon |
| Jewelry | Amazon, Flipkart, Bluestone, Tanishq, CaratLane, Melorra |

### Activity 2.5: Image analysis for jewelry
Gemini returns the outfit colours, style and formality. The server computes the **style-match score** with simple rules, with no extra AI call.

### Activity 2.6: Fallbacks and validation
- Invalid AI JSON triggers a retry, then a curated default catalogue marked `source_type="demo"`.
- The UI shows a "sample suggestions" banner whenever the fallback is used.

### Deliverables
Schemas, prompt templates, `budget_engine.py`, `links.py`, `fallbacks.py`.

### Acceptance criteria
- [ ] For any input, `allocated <= total_budget`.
- [ ] Malformed AI output never crashes the app.
- [ ] No `undefined` or empty fields reach the UI.

---

## Epic 3: Backend: FastAPI Integration

**Objective:** a secure, modular API that connects the UI to the AI layer and stores user data permanently.

### Activity 3.1: Application setup
- App factory in `main.py`, settings, static files, Jinja2 templates.
- CORS restricted to `ALLOWED_ORIGINS`.
- Global error handlers returning one error format: `{ "error": { "code", "message", "details" } }`.

### Activity 3.2: Database
- SQLAlchemy 2.x models: **users** (id, username, email, password_hash, created_at) and **plans** (id, user_id, type, input_json, result_json, total_budget, allocated, remaining, has_image, created_at).
- Alembic migrations. SQLite locally, PostgreSQL in production.
- Uploaded images are processed in memory and **not stored**.

### Activity 3.3: Authentication and sessions
- `/api/auth/register`: validate, hash with bcrypt, save.
- `/api/auth/token`: verify, issue a JWT in an **httpOnly, SameSite=Lax cookie**.
- `/api/auth/logout`: clear the cookie.
- `/api/session-info`: current user details.
- Page routes redirect to `/login` when unauthenticated, and API routes return `401` JSON.

### Activity 3.4: Planner endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/plan/home` | Generate home plan |
| POST | `/api/plan/party` | Generate party plan |
| POST | `/api/plan/jewelry` | Generate jewelry plan (multipart, optional image) |
| POST | `/api/plan/{id}/recalculate` | Change an item's tier and recompute, with no AI call |

### Activity 3.5: History
- `GET /api/history`: list the current user's plans, newest first.
- `GET /api/history/{id}`: full plan. Returns `404` for anyone else's plan.

### Activity 3.6: Housekeeping
`/health` endpoint, structured logging, and optional rate limiting on login and plan endpoints.

### Deliverables
Working API, migrations, OpenAPI docs at `/docs`.

### Acceptance criteria
- [ ] Register, login, generate a plan and open history all work end to end.
- [ ] Data survives a server restart.
- [ ] A user cannot read another user's plans.

---

## Epic 4: UI Development

**Objective:** a lightweight, responsive and intuitive frontend using HTML, CSS, vanilla JavaScript and Jinja2.

### How the application looks
- **Style:** navy-to-blue gradient header, white rounded cards with soft shadows, an orange accent for the main action on each page.
- **Key colours:** navy `#0f2747`, blue `#3b6ea8`, orange `#f7941d`, background `#f1f5f9`.
- **Layout:** mobile first. Cards are 1 column on phones, 2 on tablets, 3 on desktop.

### Activity 4.1: Base layout
Shared navbar (public and logged-in variants), footer, design tokens, and a responsive grid.

### Activity 4.2: Pages

| Page | Content |
|---|---|
| **Landing** | Hero with "Get Started", three planner cards, sample testimonials (clearly labelled as samples), footer |
| **Register** | Username, email, password, confirm password, strength indicator |
| **Login** | Username, password, link to register |
| **Dashboard** | Welcome message, three planner cards, recent activity (last 3 plans), link to history |
| **History** | Card grid: type icon, date, total, remaining, key inputs, "View Full Details" |

### Activity 4.3: Planner forms
- **Home:** budget (₹), counts of lights / fans / furniture / dining tables, room checkboxes, priority sliders, notes.
- **Party:** budget (₹), guests, event type, venue type, needs (catering / decoration / entertainment), notes.
- **Jewelry:** budget (₹), occasion, style preferences, outfit image upload with preview and a remove button.
- All forms: client-side validation, a loading state on submit, and clear error messages.

### Activity 4.4: Result view (shared)
```
┌────────────────────────────────────────────────────────────┐
│ Your Personalized Plan                                      │
│ Total ₹1,50,000 │ Allocated ₹1,42,500 │ Remaining ₹7,500    │
│ Budget health: [██████████░]  ✅ Within budget               │
│ (Donut chart: allocation by category)                        │
│ 💡 Lighting                          Allocation ₹30,000      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ LED Panel Light · 5 × ₹1,200 = ₹6,000   [Estimated]    │ │
│  │ Why: even, energy-efficient light for living rooms     │ │
│  │ Tier: ( ) Budget  (•) Balanced  ( ) Premium            │ │
│  │ Shop: [Amazon] [Flipkart] [IKEA]                       │ │
│  └────────────────────────────────────────────────────────┘ │
│ Additional suggestions · Warnings · [Save] [Regenerate]      │
└────────────────────────────────────────────────────────────┘
```
- **Party** adds per-guest cost, venue suggestions and a day-of checklist and timeline.
- **Jewelry** adds an outfit-analysis strip (colour swatches, style, formality, match score) and styling tips.
- Changing a tier calls `recalculate` and updates totals and the chart **without a page reload**.
- Budget health meter: green below 85%, amber 85 to 97%, red above 97%.

### Activity 4.5: UX states
Loading skeleton, empty history, field errors, "budget too low" message with the minimum needed, fallback banner, image error, session expired.

### Activity 4.6: Responsiveness and accessibility
Touch targets of at least 44 px, labelled inputs, visible focus ring, contrast of at least 4.5:1, and status shown with icons plus text (not colour alone).

### Deliverables
Templates, CSS (tokens, base, components, pages), JS modules (`api`, `forms`, `render`, `charts`, `tiers`, `upload`).

### Acceptance criteria
- [ ] All three planners work on desktop and mobile.
- [ ] Tier changes update totals and the chart instantly.
- [ ] Every price is visibly labelled as an estimate.
- [ ] History plans reopen exactly as generated.

---

## Epic 5: Testing and Deployment

**Objective:** prove the app is reliable, then ship it live. **No Docker is used.**

### Part A: Testing

| Test type | What is checked |
|---|---|
| **Unit (pytest)** | Budget Engine, including random-input tests that `allocated <= total_budget`; link builder; schema validation |
| **API tests** | Auth flow, planner endpoints with a **mocked Gemini**, history access control, recalculate |
| **Prompt evaluation** | About 10 realistic inputs per planner: JSON validity, budget adherence, platform relevance |
| **Edge cases** | Very low or very high budget, 0 guests, no rooms selected, wrong or oversized image, AI timeout, malformed AI JSON |
| **UI checklist** | Every page and state on desktop and mobile |

### Part B: Deployment on Render or Railway

1. Push the code to GitHub.
2. Create a **PostgreSQL** database on the host and copy its URL.
3. Create a **Web Service** from the repository:

| Setting | Value |
|---|---|
| Runtime | Python 3 |
| Build command | `pip install -r requirements.txt` |
| Pre-deploy command | `alembic upgrade head` |
| Start command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health check | `/health` |

4. Add the environment variables: `GOOGLE_API_KEY`, `GEMINI_MODEL`, `SECRET_KEY`, `DATABASE_URL`, `ALLOWED_ORIGINS`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `MAX_UPLOAD_MB`.
5. Deploy, open the live URL and run the release checklist.

**Production notes:** use secure cookies (HTTPS), convert `postgres://` URLs to `postgresql+psycopg://` if the host provides the older form, expect a slow first request on free tiers, and rotate any key that has ever been exposed.

### Release checklist
- [ ] All tests pass
- [ ] No secrets in the repository
- [ ] Database migration ran successfully
- [ ] `/health` returns OK
- [ ] Register → login → Home / Party / Jewelry plan → tier switch → history verified on the live URL
- [ ] Live URL added to this README

### Deliverables
Test suite and results, live deployment URL, updated README.

### Acceptance criteria
- [ ] The test suite passes.
- [ ] The public URL serves the full app and data persists across restarts.

---

## Conclusion

PocketSmart AI turns budgeting from guesswork into a guided, trustworthy experience. Gemini provides the intelligence, understanding context, analysing outfit images and proposing items, while a deterministic Python Budget Engine guarantees that every plan adds up and respects the user's limit. FastAPI delivers a modular, secure backend with real persistence, and a clean Jinja2 interface presents results as clear cards, charts and shopping links.

By combining **verified math, honest estimate labels, tiered choices and India-focused recommendations**, the project goes beyond the original brief. Delivered epic by epic, from Gemini initialization to a live deployment, it stays testable, easy to split across a team, and ready to grow with the stretch features: a what-if simulator, PDF export, festival-aware tips and regional languages.
