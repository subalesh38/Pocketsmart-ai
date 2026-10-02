import logging
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

# Configure root and app logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger("pocketsmart")

class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Exclude secrets from logging - only log safe metadata
        start_time = time.time()
        path = request.url.path
        method = request.method
        client_ip = request.client.host if request.client else "unknown"
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()

        # Process request
        response = await call_next(request)
        
        process_time_ms = round((time.time() - start_time) * 1000, 2)
        status_code = response.status_code

        # Log request summary without secrets or auth tokens
        if not path.startswith("/assets") and path != "/health":
            logger.info(
                f"{method} {path} - {status_code} ({process_time_ms}ms) [client={client_ip}]"
            )

        return response
