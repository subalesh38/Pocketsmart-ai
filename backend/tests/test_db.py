import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from app.db.session import Base
from app.db.repository import (
    create_user, get_user_by_username, create_plan, list_plans_for_user, get_plan_for_user
)
from app.models.user import User
from app.models.plan import Plan

@pytest.fixture(scope="module")
def engine():
    return create_engine("sqlite:///:memory:")

@pytest.fixture(scope="module")
def tables(engine):
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)

@pytest.fixture
def db(engine, tables):
    connection = engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection)()
    yield session
    session.close()
    transaction.rollback()
    connection.close()

def test_create_and_get_user(db):
    user = create_user(db, "testuser", "test@example.com", "hash")
    assert user.id is not None
    assert user.username == "testuser"
    
    fetched = get_user_by_username(db, "testuser")
    assert fetched.id == user.id

def test_user_uniqueness(db):
    create_user(db, "uniq_user1", "uniq1@example.com", "hash")
    with pytest.raises(IntegrityError):
        create_user(db, "uniq_user1", "uniq2@example.com", "hash")
    db.rollback()

    create_user(db, "uniq_user2", "uniq3@example.com", "hash")
    with pytest.raises(IntegrityError):
        create_user(db, "uniq_user3", "uniq3@example.com", "hash")
    db.rollback()

def test_plans(db):
    user1 = create_user(db, "user1", "u1@e.com", "hash")
    user2 = create_user(db, "user2", "u2@e.com", "hash")

    plan1 = create_plan(db, user1.id, "home", {}, {}, 1000, 500, 500)
    plan2 = create_plan(db, user2.id, "party", {}, {}, 2000, 1000, 1000)

    plans1 = list_plans_for_user(db, user1.id)
    assert len(plans1) == 1
    assert plans1[0].id == plan1.id

    # Fetch correct user plan
    fetched_plan = get_plan_for_user(db, user1.id, plan1.id)
    assert fetched_plan is not None
    assert fetched_plan.id == plan1.id

    # Cross user fetch fails
    cross_fetched = get_plan_for_user(db, user2.id, plan1.id)
    assert cross_fetched is None
