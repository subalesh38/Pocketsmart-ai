import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_spa_fallback_dashboard(client):
    response = client.get("/dashboard")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")
    assert "<div id=\"root\">" in response.text or "<!doctype html>" in response.text.lower()

def test_spa_fallback_nested_route(client):
    response = client.get("/planner/home")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")

def test_api_unknown_returns_json_404(client):
    response = client.get("/api/unknown_endpoint")
    assert response.status_code == 404
    assert response.headers.get("content-type") == "application/json"
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"

def test_api_unknown_post_returns_json_404(client):
    response = client.post("/api/plan/unknown_subpath", json={"foo": "bar"})
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"

def test_cors_never_wildcard_with_credentials():
    allowed_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]
    assert "*" not in allowed_origins

def test_production_safety_check_short_secret():
    # Test lifespan failure when COOKIE_SECURE is True and SECRET_KEY is short (< 32 chars)
    orig_secure = settings.COOKIE_SECURE
    orig_key = settings.SECRET_KEY
    try:
        settings.COOKIE_SECURE = True
        settings.SECRET_KEY = "short"
        from app.main import lifespan
        with pytest.raises(RuntimeError, match="Production safety check failed"):
            with TestClient(app):
                pass
    finally:
        settings.COOKIE_SECURE = orig_secure
        settings.SECRET_KEY = orig_key
