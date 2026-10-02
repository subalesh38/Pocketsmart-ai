from app.models.user import User
from app.models.plan import Plan
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.deps import get_db

engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
Base.metadata.create_all(engine)
connection = engine.connect()
SessionLocal = sessionmaker(bind=connection)

def get_db_override():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

app.dependency_overrides[get_db] = get_db_override
client = TestClient(app)

print("Register:", client.post("/api/auth/register", json={"username": "x", "email": "x@e.com", "password": "password123"}).json())
r = client.post("/api/auth/login", json={"username": "x", "password": "password123"})
print("Login status:", r.status_code)
print("Login json:", r.json())
print("Cookies:", client.cookies)

resp = client.post("/api/plan/home", json={
    "total_budget": 10000,
    "rooms": "1 bedroom"
})
print("Plan status:", resp.status_code)
print("Plan json:", resp.json())
