import time
from collections import defaultdict
from fastapi import Request
from app.core.config import settings
from app.core.errors import AppError

class InMemoryRateLimiter:
    def __init__(self, requests_limit: int, window_seconds: int = 60):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.history: dict[str, list[float]] = defaultdict(list)

    def check(self, key: str):
        now = time.time()
        window_start = now - self.window_seconds
        # Evict timestamps outside the sliding window
        self.history[key] = [t for t in self.history[key] if t > window_start]
        if len(self.history[key]) >= self.requests_limit:
            raise AppError(
                code="RATE_LIMIT_EXCEEDED",
                message="Too many requests. Please try again later.",
                status_code=429,
            )
        self.history[key].append(now)

# Rate limiter instances:
# 10 attempts per minute for auth (login/register)
auth_limiter = InMemoryRateLimiter(requests_limit=10, window_seconds=60)
# 20 plan generations per minute
plan_limiter = InMemoryRateLimiter(requests_limit=20, window_seconds=60)

def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

def rate_limit_auth(request: Request):
    if not settings.RATE_LIMIT_ENABLED:
        return
    ip = _get_client_ip(request)
    if ip == "testclient":
        return
    auth_limiter.check(ip)

def rate_limit_plan(request: Request):
    if not settings.RATE_LIMIT_ENABLED:
        return
    ip = _get_client_ip(request)
    if ip == "testclient":
        return
    plan_limiter.check(ip)
