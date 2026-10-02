import json
import uuid
from app.schemas.ai_output import AIHomeResult, AIPartyResult, AIJewelryResult
from app.schemas.plan import PlanItem, TierPrices, PlanResult
from app.services.gemini_client import generate_json
from app.services.prompts import home as home_prompt, party as party_prompt, jewelry as jewelry_prompt
from app.services.fallbacks import get_fallback
from app.services.links import generate_links
from app.services.budget_engine import build_plan
from pydantic import ValidationError

def compute_style_match_score(item_tags: str, outfit_colors: list[str], outfit_style: str) -> int:
    score = 50
    tags = item_tags.lower()
    if outfit_style and outfit_style.lower() in tags:
        score += 20
    for color in outfit_colors:
        if color.lower() in tags:
            score += 15
    return min(100, score)

def run_planner(plan_type: str, validated_input: dict, image_bytes: bytes | None = None, mime: str | None = None) -> PlanResult:
    if plan_type == "home":
        prompt = home_prompt.build_prompt(validated_input)
        ModelClass = AIHomeResult
    elif plan_type == "party":
        prompt = party_prompt.build_prompt(validated_input)
        ModelClass = AIPartyResult
    elif plan_type == "jewelry":
        prompt = jewelry_prompt.build_prompt(validated_input)
        ModelClass = AIJewelryResult
    else:
        raise ValueError("Invalid plan type")

    raw_json = None
    is_fallback = False
    validated_ai = None
    
    for attempt in range(2):
        try:
            raw_json = generate_json(prompt, image_bytes, mime)
            parsed = json.loads(raw_json)
            validated_ai = ModelClass(**parsed)
            break
        except (Exception, ValidationError) as e:
            if attempt == 1:
                raw_json = get_fallback(plan_type)
                parsed = json.loads(raw_json)
                validated_ai = ModelClass(**parsed)
                is_fallback = True

    if validated_ai is None:
        from app.core.errors import AppError
        raise AppError(code="AI_UNAVAILABLE", message="AI generation failed after retries", status_code=503)

    plan_items = []
    for item in validated_ai.items:
        plan_item = PlanItem(
            id=str(uuid.uuid4()),
            name=item.name,
            description=item.description,
            category=item.category,
            quantity=item.quantity,
            priority=item.priority,
            tier_prices=TierPrices(
                budget=item.tier_prices.budget,
                balanced=item.tier_prices.balanced,
                premium=item.tier_prices.premium
            ),
            reason=item.reason,
            search_terms=item.search_terms,
            tier="balanced",
            source_type="demo" if is_fallback else "ai",
            links=generate_links(item.category, item.search_terms)
        )
        plan_items.append(plan_item)
        
    total_budget = validated_input.get("total_budget", 0)
    guests = validated_input.get("guests")
    
    plan_result = build_plan(
        total_budget=total_budget,
        items=plan_items,
        plan_type=plan_type,
        guests=guests
    )

    if plan_type == "party" and isinstance(validated_ai, AIPartyResult):
        plan_result.checklist = [c.model_dump() for c in validated_ai.checklist]
        
    if plan_type == "jewelry" and isinstance(validated_ai, AIJewelryResult):
        outfit = validated_ai.outfit_analysis
        plan_result.outfit_analysis = outfit.model_dump()
        for item in plan_result.items:
            combined_tags = f"{item.description} {item.search_terms} {item.name}"
            item.match_score = compute_style_match_score(combined_tags, outfit.colors, outfit.style)

    if is_fallback:
        plan_result.warnings.append("AI generation failed. Showing sample suggestions.")

    return plan_result
