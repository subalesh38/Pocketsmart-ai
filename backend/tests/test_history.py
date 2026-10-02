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

def test_history_empty(client):
    client.post("/api/auth/register", json={"username": "hist1", "email": "h1@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "hist1", "password": "password123"})
    
    res = client.get("/api/history")
    assert res.status_code == 200
    assert len(res.json()) == 0

import time

def test_history_ordering_and_recent(client, mock_run_planner):
    client.post("/api/auth/register", json={"username": "hist2", "email": "h2@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "hist2", "password": "password123"})
    
    # Create 4 plans
    for i in range(4):
        client.post("/api/plan/home", json={
            "total_budget": 10000 + i,
            "rooms": f"Room {i}"
        })
        time.sleep(1)
        
    res = client.get("/api/history")
    assert res.status_code == 200
    assert len(res.json()) == 4
    
    budgets = [p["total_budget"] for p in res.json()]
    assert budgets == [10003, 10002, 10001, 10000]
    
    rec = client.get("/api/history/recent")
    assert len(rec.json()) == 3
    assert [p["total_budget"] for p in rec.json()] == [10003, 10002, 10001]

def test_history_pagination(client, mock_run_planner):
    client.post("/api/auth/register", json={"username": "hist3", "email": "h3@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "hist3", "password": "password123"})
    
    for i in range(5):
        client.post("/api/plan/home", json={"total_budget": 10000 + i, "rooms": f"Room {i}"})
        time.sleep(1)
        
    res = client.get("/api/history?limit=2&offset=1")
    assert res.status_code == 200
    assert len(res.json()) == 2
    budgets = [p["total_budget"] for p in res.json()]
    assert budgets == [10003, 10002]

def test_history_detail(client, mock_run_planner):
    client.post("/api/auth/register", json={"username": "hist4", "email": "h4@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "hist4", "password": "password123"})
    
    home_resp = client.post("/api/plan/home", json={"total_budget": 10000, "rooms": "1 bedroom"})
    plan_id = home_resp.json()["plan_id"]
    
    res = client.get(f"/api/history/{plan_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["plan_id"] == plan_id
    assert "created_at" in data
    assert data["allocated"] == home_resp.json()["allocated"]

def test_history_detail_404(client, mock_run_planner):
    client.post("/api/auth/register", json={"username": "hist5", "email": "h5@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "hist5", "password": "password123"})
    
    home_resp = client.post("/api/plan/home", json={"total_budget": 10000, "rooms": "1 bedroom"})
    plan_id = home_resp.json()["plan_id"]
    
    client.post("/api/auth/register", json={"username": "hist6", "email": "h6@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "hist6", "password": "password123"})
    
    res = client.get(f"/api/history/{plan_id}")
    assert res.status_code == 404
