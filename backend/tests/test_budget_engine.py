import pytest
from hypothesis import given, strategies as st
from app.schemas.plan import PlanItem, TierPrices
from app.services.budget_engine import build_plan, change_tier
from app.core.errors import AppError

def dummy_item(id="1", priority=1, prices=(10, 20, 30), qty=1):
    return PlanItem(
        id=id,
        name=f"Item {id}",
        description="Desc",
        category="Cat",
        quantity=qty,
        priority=priority,
        tier_prices=TierPrices(budget=prices[0], balanced=prices[1], premium=prices[2]),
        reason="Reason",
        search_terms="Terms",
        tier="balanced",
        source_type="ai"
    )

def test_downgrade_and_drop_order():
    items = [
        dummy_item("1", 1, (10, 20, 30)),
        dummy_item("2", 2, (50, 100, 150)),
        dummy_item("3", 3, (100, 200, 300)),
    ]
    plan = build_plan(300, items.copy(), "home")
    assert plan.allocated <= 300
    assert plan.items[2].tier == "budget"

    plan2 = build_plan(150, items.copy(), "home")
    assert len(plan2.items) == 2
    assert "3" not in [i.id for i in plan2.items]

def test_budget_too_low():
    items = [dummy_item("1", 1, (100, 200, 300))]
    with pytest.raises(AppError) as exc:
        build_plan(50, items, "home")
    assert exc.value.code == "BUDGET_TOO_LOW"
    assert exc.value.details["minimum"] == 100

def test_contingency_and_per_guest():
    items = [dummy_item("1", 1, (10, 20, 30))]
    plan = build_plan(100, items, "party", guests=4)
    assert plan.contingency == 8
    assert plan.allocated == 28
    assert plan.remaining == 72
    assert plan.per_guest_cost == 7

def test_change_tier():
    items = [dummy_item("1", 1, (10, 20, 30))]
    plan = build_plan(100, items, "home")
    assert plan.items[0].tier == "balanced"
    
    new_plan = change_tier(plan, "1", "premium")
    assert new_plan.items[0].tier == "premium"
    assert new_plan.allocated == 30
    assert new_plan.remaining == 70

    plan2 = build_plan(20, items, "home")
    with pytest.raises(AppError):
        change_tier(plan2, "1", "premium")

def test_negative_quantity():
    with pytest.raises(ValueError):
        dummy_item("1", 1, (10, 20, 30), -1)

item_strategy = st.builds(
    PlanItem,
    id=st.uuids().map(str),
    name=st.just("Item"),
    description=st.just("Desc"),
    category=st.just("Cat"),
    quantity=st.integers(1, 10),
    priority=st.integers(1, 3),
    tier_prices=st.builds(TierPrices, budget=st.integers(10, 50), balanced=st.integers(60, 100), premium=st.integers(110, 200)),
    reason=st.just("Reason"),
    search_terms=st.just("Terms"),
    tier=st.just("balanced"),
    source_type=st.just("ai")
)

@given(budget=st.integers(50, 10000), items=st.lists(item_strategy, max_size=10))
def test_plan_never_exceeds_budget(budget, items):
    try:
        plan = build_plan(budget, list(items), "home")
        assert plan.allocated <= budget
        assert plan.remaining == budget - plan.allocated
    except AppError as e:
        if e.code == "BUDGET_TOO_LOW":
            pass
        else:
            raise
