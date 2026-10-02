import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from app.core.config import settings
from app.core.errors import AppError, app_error_handler
from app.core.logging import logger, StructuredLoggingMiddleware
from app.routes import auth, planners, history

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Production safety checks
    if settings.COOKIE_SECURE:
        if not settings.SECRET_KEY or len(settings.SECRET_KEY) < 32:
            raise RuntimeError(
                "Production safety check failed: SECRET_KEY must be configured and at least 32 characters long when COOKIE_SECURE=True."
            )
    logger.info("PocketSmart AI Backend initialized successfully.")
    yield
    logger.info("PocketSmart AI Backend shutting down.")

app = FastAPI(
    title="PocketSmart AI API",
    lifespan=lifespan,
)

# Structured request logging
app.add_middleware(StructuredLoggingMiddleware)

# Proxy headers middleware (honours X-Forwarded-Proto, X-Forwarded-For)
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])

# CORS: allow only explicit origins, never wildcard with credentials
allowed_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]
if "*" in allowed_origins:
    raise RuntimeError("CORS configuration error: Wildcard '*' cannot be used in ALLOWED_ORIGINS with allow_credentials=True.")

if allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Exception handlers
app.add_exception_handler(AppError, app_error_handler)

# API routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(planners.router, prefix="/api/plan", tags=["plan"])
app.include_router(history.router, prefix="/api/history", tags=["history"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# API 404 handler for unknown /api/* routes
@app.api_route("/api/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"], include_in_schema=False)
async def api_not_found(path_name: str):
    return JSONResponse(
        status_code=404,
        content={
            "error": {
                "code": "NOT_FOUND",
                "message": f"API endpoint '/api/{path_name}' not found",
                "details": {},
            }
        },
    )

# Frontend SPA static files & fallback
dist_dir = settings.FRONTEND_DIST_DIR
if not dist_dir:
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../dist"))

if os.path.isdir(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    index_html = os.path.join(dist_dir, "index.html")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(request: Request, full_path: str):
        # Exclude reserved paths
        if full_path.startswith("api") or full_path in ("health", "docs", "openapi.json", "redoc"):
            if full_path.startswith("api"):
                return JSONResponse(
                    status_code=404,
                    content={
                        "error": {
                            "code": "NOT_FOUND",
                            "message": f"API endpoint '/{full_path}' not found",
                            "details": {},
                        }
                    },
                )
            raise HTTPException(status_code=404, detail="Not Found")

        # Static assets in dist root (favicon, icons, etc.)
        static_file = os.path.join(dist_dir, full_path)
        if full_path and os.path.isfile(static_file):
            return FileResponse(static_file)

        # SPA fallback
        if os.path.isfile(index_html):
            return FileResponse(index_html)
        raise HTTPException(status_code=404, detail="Frontend index.html not found")
else:
    logger.warning(
        f"Frontend dist directory '{dist_dir}' not found. SPA static serving is disabled (normal during standalone backend dev)."
    )
