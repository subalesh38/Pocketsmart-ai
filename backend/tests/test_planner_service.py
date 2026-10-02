import pytest
from app.services.planner_service import run_planner, compute_style_match_score

valid_home_json = """
{
  "items": [
    {
      "name": "Ceiling Fan",
      "description": "Standard 1200mm fan",
      "category": "ceiling_fans",
      "quantity": 2,
      "priority": 1,
      "tier_prices": {
        "budget": 1500,
        "balanced": 2500,
        "premium": 4000
      },
      "reason": "Essential for bedrooms",
      "search_terms": "1200mm ceiling fan"
    }
  ]
}
"""

def test_run_planner_valid(monkeypatch):
    monkeypatch.setattr("app.services.planner_service.generate_json", lambda *a: valid_home_json)
    
    inputs = {"total_budget": 10000}
    plan = run_planner("home", inputs)
    
    assert len(plan.items) == 1
    assert plan.items[0].source_type == "ai"
    assert "amazon.in" in plan.items[0].links[0]["url"].lower()
    assert len(plan.items[0].links) > 0
    assert not any("failed" in w for w in plan.warnings)

def test_run_planner_malformed_json_fallback(monkeypatch):
    monkeypatch.setattr("app.services.planner_service.generate_json", lambda *a: "{ invalid json ")
    
    inputs = {"total_budget": 5000}
    plan = run_planner("home", inputs)
    
    assert plan.items[0].source_type == "demo"
    assert any("failed" in w for w in plan.warnings)

def test_run_planner_schema_invalid_fallback(monkeypatch):
    invalid_schema = '{"items": [{"name": "Fan", "quantity": -5}]}'
    monkeypatch.setattr("app.services.planner_service.generate_json", lambda *a: invalid_schema)
    
    inputs = {"total_budget": 5000}
    plan = run_planner("home", inputs)
    
    assert plan.items[0].source_type == "demo"
    assert any("failed" in w for w in plan.warnings)

def test_jewelry_score():
    score = compute_style_match_score("gold necklace traditional", ["red", "gold"], "traditional")
    assert score == 85

def test_no_empty_fields_in_plan(monkeypatch):
    monkeypatch.setattr("app.services.planner_service.generate_json", lambda *a: valid_home_json)
    inputs = {"total_budget": 10000}
    plan = run_planner("home", inputs)
    assert plan.items[0].links is not None
    assert plan.items[0].tier_prices is not None
