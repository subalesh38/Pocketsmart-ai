from fastapi import APIRouter, Depends, Query
from typing import cast
from sqlalchemy.orm import Session
from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.db.repository import list_plans_for_user, get_plan_for_user
from app.schemas.history import HistoryListItem
from app.core.errors import AppError

router = APIRouter()

def get_summary(plan) -> str:
    inputs = plan.input_json or {}
    if plan.type == "home":
        rooms = inputs.get("rooms", "")
        return f"Rooms: {rooms}"
    elif plan.type == "party":
        guests = inputs.get("guests", "")
        return f"Guests: {guests}"
    elif plan.type == "jewelry":
        occasion = inputs.get("occasion", "")
        return f"Occasion: {occasion}"
    return "Plan"

def _to_item(p) -> HistoryListItem:
    return HistoryListItem(
        id=str(p.id),
        type=str(p.type),
        created_at=p.created_at,
        total_budget=int(p.total_budget),
        allocated=int(p.allocated),
        remaining=int(p.remaining),
        summary=get_summary(p),
        has_image=bool(p.has_image),
    )

@router.get("/recent", response_model=list[HistoryListItem])
def get_recent_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plans = list_plans_for_user(db, cast(int, current_user.id), limit=3, offset=0)
    return [_to_item(p) for p in plans]

@router.get("", response_model=list[HistoryListItem])
def get_history(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plans = list_plans_for_user(db, cast(int, current_user.id), limit=limit, offset=offset)
    return [_to_item(p) for p in plans]

@router.get("/{id}")
def get_history_detail(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plan = get_plan_for_user(db, cast(int, current_user.id), id)
    if not plan:
        raise AppError("NOT_FOUND", "Plan not found", status_code=404)
        
    res = plan.result_json.copy()
    res["plan_id"] = plan.id
    res["created_at"] = plan.created_at.isoformat()
    return res
