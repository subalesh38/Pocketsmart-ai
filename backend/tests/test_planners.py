import pytest
from app.models.user import User
from app.models.plan import Plan
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
            total_budget=inputs["total_budget"],
            allocated=5000,
            remaining=inputs["total_budget"] - 5000,
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
                    links=[]
                )
            ]
        )
    monkeypatch.setattr("app.routes.planners.run_planner", fake_run)

def test_home_planner_unauthenticated(client):
    response = client.post("/api/plan/home", json={
        "total_budget": 10000,
        "rooms": "1 bedroom"
    })
    assert response.status_code == 401

def test_home_planner_validation_error(client, mock_run_planner):
    client.post("/api/auth/register", json={"username": "user1", "email": "user1@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "user1", "password": "password123"})
    
    response = client.post("/api/plan/home", json={
        "total_budget": 100, 
        "rooms": "1 bedroom"
    })
    assert response.status_code == 422 

def test_home_planner_success(client, mock_run_planner):
    client.post("/api/auth/register", json={"username": "user2", "email": "user2@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "user2", "password": "password123"})
    
    response = client.post("/api/plan/home", json={
        "total_budget": 10000,
        "rooms": "1 bedroom"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["allocated"] == 5000
    assert "plan_id" in data

def test_recalculate_success(client, mock_run_planner):
    client.post("/api/auth/register", json={"username": "user3", "email": "user3@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "user3", "password": "password123"})
    
    home_resp = client.post("/api/plan/home", json={
        "total_budget": 10000,
        "rooms": "1 bedroom"
    })
    plan_id = home_resp.json()["plan_id"]
    
    response = client.post(f"/api/plan/{plan_id}/recalculate", json={
        "item_id": "item-123",
        "tier": "budget"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["items"][0]["tier"] == "budget"
    assert data["allocated"] == 1000 

def test_recalculate_budget_too_low(client, mock_run_planner):
    client.post("/api/auth/register", json={"username": "user4", "email": "user4@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "user4", "password": "password123"})
    
    response = client.post("/api/plan/home", json={
        "total_budget": 5000,
        "rooms": "1 bedroom"
    })
    plan_id = response.json()["plan_id"]
    
    response = client.post(f"/api/plan/{plan_id}/recalculate", json={
        "item_id": "item-123",
        "tier": "premium"
    })
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "BUDGET_TOO_LOW"
    assert data["error"]["details"]["minimum"] == 10000

def test_recalculate_cross_user(client, mock_run_planner):
    client.post("/api/auth/register", json={"username": "user5", "email": "user5@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "user5", "password": "password123"})
    
    home_resp = client.post("/api/plan/home", json={
        "total_budget": 10000,
        "rooms": "1 bedroom"
    })
    plan_id = home_resp.json()["plan_id"]
    
    # Create another user and login
    client.post("/api/auth/register", json={"username": "user6", "email": "user6@e.com", "password": "password123"})
    client.post("/api/auth/login", json={"username": "user6", "password": "password123"})
    
    response = client.post(f"/api/plan/{plan_id}/recalculate", json={
        "item_id": "item-123",
        "tier": "budget"
    })
    assert response.status_code == 404
