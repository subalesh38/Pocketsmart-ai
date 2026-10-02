from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.user import User
from app.models.plan import Plan

def create_user(db: Session, username: str, email: str, password_hash: str) -> User:
    user = User(username=username, email=email, password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()

def create_plan(db: Session, user_id: int, type: str, input_json: dict, result_json: dict, total_budget: int, allocated: int, remaining: int, has_image: bool = False) -> Plan:
    plan = Plan(
        user_id=user_id,
        type=type,
        input_json=input_json,
        result_json=result_json,
        total_budget=total_budget,
        allocated=allocated,
        remaining=remaining,
        has_image=has_image
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

def list_plans_for_user(db: Session, user_id: int, limit: int = 100, offset: int = 0) -> list[Plan]:
    return db.query(Plan).filter(Plan.user_id == user_id).order_by(desc(Plan.created_at)).offset(offset).limit(limit).all()

def get_plan_for_user(db: Session, user_id: int, plan_id: str) -> Plan | None:
    return db.query(Plan).filter(Plan.user_id == user_id, Plan.id == plan_id).first()

def update_plan(db: Session, plan: Plan) -> Plan:
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan
