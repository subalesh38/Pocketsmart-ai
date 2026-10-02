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

@pytest.fixture
def mock_run_planner(monkeypatch):
    from app.schemas.plan import PlanResult, PlanItem, TierPrices, CategoryTotal
    
    def fake_run(plan_type, inputs, image_bytes=None, mime=None):
        return PlanResult(
            total_budget=inputs.get("total_budget", 10000),
            allocated=5000,
            remaining=inputs.get("total_budget", 10000) - 5000,
            categories=[CategoryTotal(category="test", allocated=5000, percent_of_budget=50)],
            items=[
                PlanItem(
                    id="item-123",
                    name="Test item",
                    description="Desc",
                    category="test",
                    quantity=1,
                    priority=1,
                    tier_prices=TierPrices(budget=1000, balanced=5000, premium=10000),
                    reason="Reason",
                    search_terms="Terms",
                    tier="balanced",
                    source_type="ai",
                    links=[],
                    match_score=85 if plan_type == "jewelry" else None
                )
            ],
            checklist=[{"task": "test", "time": "test"}] if plan_type == "party" else [],
            outfit_analysis={"colors":["red"],"style":"test","formality":"test"} if plan_type == "jewelry" else None,
            guests=inputs.get("guests"),
            per_guest_cost=50 if plan_type == "party" else None,
            contingency=500 if plan_type == "party" else 0
        )
    monkeypatch.setattr("app.routes.planners.run_planner", fake_run)

def test_party_planner_success(client, mock_run_planner):
    client.post("/api/auth/register", json={"username": "party1", "email": "party1@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "party1", "password": "password123"})
    
    res = client.post("/api/plan/party", json={
        "total_budget": 10000,
        "guests": 50,
        "party_type": "birthday",
        "venue_type": "indoor",
        "needs": "food",
        "notes": ""
    })
    assert res.status_code == 200
    assert res.json()["guests"] == 50
    assert len(res.json()["checklist"]) > 0

def test_party_planner_validation_fail(client):
    client.post("/api/auth/register", json={"username": "party2", "email": "party2@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "party2", "password": "password123"})
    
    res = client.post("/api/plan/party", json={
        "total_budget": -100, 
        "guests": 50,
        "party_type": "birthday",
        "venue_type": "indoor",
        "needs": "food"
    })
    assert res.status_code == 422

def test_jewelry_planner_success(client, mock_run_planner):
    client.post("/api/auth/register", json={"username": "jewel1", "email": "j1@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "jewel1", "password": "password123"})
    
    res = client.post("/api/plan/jewelry", data={
        "total_budget": 10000,
        "occasion": "wedding",
        "preferences": "gold",
        "notes": ""
    })
    assert res.status_code == 200
    assert res.json()["outfit_analysis"]["style"] == "test"
    assert res.json()["items"][0]["match_score"] == 85

def test_jewelry_planner_invalid_image_type(client):
    client.post("/api/auth/register", json={"username": "jewel2", "email": "j2@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "jewel2", "password": "password123"})
    
    res = client.post("/api/plan/jewelry", data={
        "total_budget": 10000,
        "occasion": "wedding",
        "preferences": "gold",
        "notes": ""
    }, files={"image": ("test.txt", b"not an image", "text/plain")})
    
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "IMAGE_INVALID"

def test_jewelry_planner_oversize_image(client):
    client.post("/api/auth/register", json={"username": "jewel3", "email": "j3@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "jewel3", "password": "password123"})
    
    res = client.post("/api/plan/jewelry", data={
        "total_budget": 10000,
        "occasion": "wedding",
        "preferences": "gold",
        "notes": ""
    }, files={"image": ("test.jpg", b"a" * (6 * 1024 * 1024), "image/jpeg")})
    
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "IMAGE_INVALID"

def test_jewelry_planner_valid_image(client, mock_run_planner):
    client.post("/api/auth/register", json={"username": "jewel4", "email": "j4@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "jewel4", "password": "password123"})
    
    from PIL import Image
    import io
    img = Image.new("RGB", (10, 10))
    b = io.BytesIO()
    img.save(b, format="JPEG")
    b.seek(0)

    res = client.post("/api/plan/jewelry", data={
        "total_budget": 10000,
        "occasion": "wedding",
        "preferences": "gold",
        "notes": ""
    }, files={"image": ("test.jpg", b.read(), "image/jpeg")})
    
    assert res.status_code == 200
    assert res.json()["outfit_analysis"] is not None

def test_unauthenticated(client):
    res = client.post("/api/plan/party", json={
        "total_budget": 10000,
        "guests": 50,
        "party_type": "birthday",
        "venue_type": "indoor",
        "needs": "food",
        "notes": ""
    })
    assert res.status_code == 401
