import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.deps import get_db

@pytest.fixture(scope="module")
def engine():
    return create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False}
    )

@pytest.fixture(autouse=True)
def override_get_db(engine):
    Base.metadata.create_all(engine)
    connection = engine.connect()
    transaction = connection.begin()
    SessionLocal = sessionmaker(bind=connection)

    def get_db_override():
        session = SessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = get_db_override
    yield
    app.dependency_overrides.clear()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client():
    return TestClient(app)

def test_register_ok(client):
    response = client.post("/api/auth/register", json={
        "username": "authuser",
        "email": "authuser@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert response.json()["username"] == "authuser"
    assert "password" not in response.json()

def test_register_duplicate(client):
    client.post("/api/auth/register", json={
        "username": "authuser2",
        "email": "authuser2@example.com",
        "password": "password123"
    })
    response = client.post("/api/auth/register", json={
        "username": "authuser2",
        "email": "authuser2@example.com",
        "password": "password123"
    })
    assert response.status_code == 409

def test_register_invalid(client):
    response = client.post("/api/auth/register", json={
        "username": "au",
        "email": "notanemail",
        "password": "short"
    })
    assert response.status_code == 422

def test_login_ok_and_me(client):
    client.post("/api/auth/register", json={
        "username": "loginuser",
        "email": "login@example.com",
        "password": "password123"
    })

    login_resp = client.post("/api/auth/login", json={
        "username": "loginuser",
        "password": "password123"
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.cookies
    
    me_resp = client.get("/api/auth/me")
    assert me_resp.status_code == 200
    assert me_resp.json()["username"] == "loginuser"

def test_login_wrong_password(client):
    resp = client.post("/api/auth/login", json={
        "username": "loginuser",
        "password": "wrongpassword"
    })
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "INVALID_CREDENTIALS"

def test_me_without_cookie(client):
    new_client = TestClient(app)
    resp = new_client.get("/api/auth/me")
    assert resp.status_code == 401

def test_logout(client):
    client.post("/api/auth/register", json={
        "username": "logoutuser",
        "email": "logout@example.com",
        "password": "password123"
    })
    client.post("/api/auth/login", json={
        "username": "logoutuser",
        "password": "password123"
    })
    
    logout_resp = client.post("/api/auth/logout")
    assert logout_resp.status_code == 200
    
    cookie = client.cookies.get("access_token")
    assert cookie is None or cookie == ""

def test_expired_token(client):
    from app.core.security import create_access_token
    import jwt
    from datetime import datetime, timedelta, timezone
    from app.core.config import settings
    
    expire = datetime.now(timezone.utc) - timedelta(minutes=1)
    to_encode = {"sub": "1", "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    
    client.cookies.set("access_token", encoded_jwt)
    me_resp = client.get("/api/auth/me")
    assert me_resp.status_code == 401
