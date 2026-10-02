from fastapi import APIRouter, Depends, UploadFile, File, Form
from typing import cast
import io
from PIL import Image
from app.core.config import settings
from sqlalchemy.orm import Session
from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.home import HomePlanInput
from app.schemas.party import PartyPlanInput
from app.schemas.planners import RecalculateInput
from app.services.planner_service import run_planner
from app.services.budget_engine import change_tier
from app.db.repository import create_plan, get_plan_for_user, update_plan
from app.core.errors import AppError
from app.schemas.plan import PlanResult
from app.core.rate_limit import rate_limit_plan

router = APIRouter()

@router.post("/home", dependencies=[Depends(rate_limit_plan)])
def generate_home_plan(
    inputs: HomePlanInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan_result = run_planner("home", inputs.model_dump())
    
    db_plan = create_plan(
        db=db,
        user_id=cast(int, current_user.id),
        type="home",
        input_json=inputs.model_dump(),
        result_json=plan_result.model_dump(),
        total_budget=plan_result.total_budget,
        allocated=plan_result.allocated,
        remaining=plan_result.remaining,
        has_image=False
    )
    
    res = plan_result.model_dump()
    res["plan_id"] = db_plan.id
    return res

@router.post("/{id}/recalculate")
def recalculate_plan(
    id: str,
    inputs: RecalculateInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_plan = get_plan_for_user(db, cast(int, current_user.id), id)
    if not db_plan:
        raise AppError("NOT_FOUND", "Plan not found", status_code=404)
        
    plan_result = PlanResult.model_validate(db_plan.result_json)
    
    updated_plan_result = change_tier(plan_result, inputs.item_id, inputs.tier)
    
    setattr(db_plan, "result_json", updated_plan_result.model_dump())
    setattr(db_plan, "allocated", updated_plan_result.allocated)
    setattr(db_plan, "remaining", updated_plan_result.remaining)
    
    update_plan(db, db_plan)
    
    res = updated_plan_result.model_dump()
    res["plan_id"] = db_plan.id
    return res

@router.post("/party", dependencies=[Depends(rate_limit_plan)])
def generate_party_plan(
    inputs: PartyPlanInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan_result = run_planner("party", inputs.model_dump())
    
    db_plan = create_plan(
        db=db,
        user_id=cast(int, current_user.id),
        type="party",
        input_json=inputs.model_dump(),
        result_json=plan_result.model_dump(),
        total_budget=plan_result.total_budget,
        allocated=plan_result.allocated,
        remaining=plan_result.remaining,
        has_image=False
    )
    
    res = plan_result.model_dump()
    res["plan_id"] = db_plan.id
    return res

@router.post("/jewelry", dependencies=[Depends(rate_limit_plan)])
async def generate_jewelry_plan(
    total_budget: int = Form(ge=1000, le=10000000),
    occasion: str = Form(min_length=1),
    preferences: str = Form(min_length=1),
    notes: str = Form(default="", max_length=500),
    image: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image_bytes = None
    mime_type = None
    if image and image.filename:
        content = await image.read()
        if len(content) > settings.MAX_UPLOAD_MB * 1024 * 1024:
            raise AppError("IMAGE_INVALID", f"Image exceeds {settings.MAX_UPLOAD_MB}MB limit", status_code=422)
            
        try:
            with Image.open(io.BytesIO(content)) as img:
                img.verify()
                if (img.format or "").lower() not in ["jpeg", "jpg", "png", "webp"]:
                    raise AppError("IMAGE_INVALID", "Unsupported image format", status_code=422)
        except Exception:
            raise AppError("IMAGE_INVALID", "Invalid image file", status_code=422)
            
        image_bytes = content
        mime_type = image.content_type

    inputs = {
        "total_budget": total_budget,
        "occasion": occasion,
        "style": preferences,
        "notes": notes
    }
    
    plan_result = run_planner("jewelry", inputs, image_bytes, mime_type)
    
    db_plan = create_plan(
        db=db,
        user_id=cast(int, current_user.id),
        type="jewelry",
        input_json=inputs,
        result_json=plan_result.model_dump(),
        total_budget=plan_result.total_budget,
        allocated=plan_result.allocated,
        remaining=plan_result.remaining,
        has_image=image_bytes is not None
    )
    
    res = plan_result.model_dump()
    res["plan_id"] = db_plan.id
    return res
