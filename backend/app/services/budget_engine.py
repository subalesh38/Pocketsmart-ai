from app.schemas.plan import PlanItem, PlanResult, CategoryTotal
from app.core.errors import AppError
import copy

TIERS = ("budget", "balanced", "premium")

def line_total(item: PlanItem) -> int:
    return getattr(item.tier_prices, item.tier) * item.quantity

def build_plan(
    total_budget: int, 
    items: list[PlanItem], 
    plan_type: str, 
    priorities: dict | None = None, 
    guests: int | None = None
) -> PlanResult:
    for item in items:
        if item.quantity <= 0:
            raise AppError(code="VALIDATION_ERROR", message=f"Item {item.name} has invalid quantity.")
        item.tier = "balanced"

    contingency = 0
    available_budget = total_budget
    if plan_type == "party":
        contingency = int(total_budget * 0.08)
        available_budget -= contingency

    def get_total() -> int:
        return sum(line_total(i) for i in items)

    warnings = []

    while get_total() > available_budget:
        down = [i for i in items if TIERS.index(i.tier) > 0]
        if not down:
            break
        v = max(down, key=lambda i: (i.priority, line_total(i)))
        v.tier = TIERS[TIERS.index(v.tier) - 1]

    while get_total() > available_budget:
        drop = [i for i in items if i.priority > 1]
        if not drop:
            break
        v = max(drop, key=lambda i: (i.priority, line_total(i)))
        items.remove(v)
        warnings.append(f"Removed '{v.name}' to stay within budget.")

    final_total = get_total()
    if final_total > available_budget:
        raise AppError(
            code="BUDGET_TOO_LOW", 
            message=f"Minimum for your must-have items is ₹{final_total + contingency}.", 
            details={"minimum": final_total + contingency},
            status_code=422
        )

    allocated = final_total + contingency
    remaining = total_budget - allocated

    cat_totals = {}
    for item in items:
        cat_totals[item.category] = cat_totals.get(item.category, 0) + line_total(item)
    
    categories = [
        CategoryTotal(
            category=cat, 
            allocated=amt, 
            percent_of_budget=round((amt / total_budget) * 100, 2)
        )
        for cat, amt in cat_totals.items()
    ]

    per_guest = None
    if plan_type == "party" and guests and guests > 0:
        per_guest = allocated // guests

    return PlanResult(
        total_budget=total_budget,
        allocated=allocated,
        remaining=remaining,
        categories=categories,
        items=items,
        warnings=warnings,
        contingency=contingency,
        guests=guests,
        per_guest_cost=per_guest
    )

def change_tier(plan: PlanResult, item_id: str, tier: str) -> PlanResult:
    if tier not in TIERS:
        raise AppError(code="VALIDATION_ERROR", message="Invalid tier")
    
    new_plan = copy.deepcopy(plan)
    
    target_item = next((i for i in new_plan.items if i.id == item_id), None)
    if not target_item:
        raise AppError(code="NOT_FOUND", message="Item not found", status_code=404)
    
    old_line_total = line_total(target_item)
    target_item.tier = tier
    new_line_total = line_total(target_item)
    
    diff = new_line_total - old_line_total
    
    if new_plan.remaining - diff < 0:
        raise AppError(
            code="BUDGET_TOO_LOW", 
            message="This change exceeds your total budget.",
            details={"minimum": new_plan.total_budget + (diff - new_plan.remaining)},
            status_code=422
        )
    
    new_plan.allocated += diff
    new_plan.remaining -= diff
    
    for cat in new_plan.categories:
        if cat.category == target_item.category:
            cat.allocated += diff
            cat.percent_of_budget = round((cat.allocated / new_plan.total_budget) * 100, 2)
            break
            
    if new_plan.guests and new_plan.guests > 0:
        new_plan.per_guest_cost = new_plan.allocated // new_plan.guests

    return new_plan
