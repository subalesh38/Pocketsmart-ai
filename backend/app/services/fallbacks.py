import json

FALLBACK_HOME = {
    "items": [
        {
            "name": "Sample Table Lamp",
            "description": "Standard desk lighting",
            "category": "lighting",
            "quantity": 1,
            "priority": 1,
            "tier_prices": {"budget": 500, "balanced": 1200, "premium": 3000},
            "reason": "Essential for work",
            "search_terms": "table lamp"
        }
    ]
}

FALLBACK_PARTY = {
    "items": [
        {
            "name": "Sample Catering",
            "description": "Basic catering service",
            "category": "catering",
            "quantity": 10,
            "priority": 1,
            "tier_prices": {"budget": 300, "balanced": 500, "premium": 1000},
            "reason": "Food is essential",
            "search_terms": "party catering"
        }
    ],
    "checklist": [
        {"task": "Call caterer", "time": "Morning"}
    ]
}

FALLBACK_JEWELRY = {
    "items": [
        {
            "name": "Sample Gold Necklace",
            "description": "Traditional necklace",
            "category": "jewelry",
            "quantity": 1,
            "priority": 1,
            "tier_prices": {"budget": 5000, "balanced": 15000, "premium": 50000},
            "reason": "Matches the outfit",
            "search_terms": "gold necklace"
        }
    ],
    "outfit_analysis": {
        "colors": ["red", "gold"],
        "style": "traditional",
        "formality": "high"
    }
}

def get_fallback(plan_type: str) -> str:
    if plan_type == "home":
        return json.dumps(FALLBACK_HOME)
    elif plan_type == "party":
        return json.dumps(FALLBACK_PARTY)
    elif plan_type == "jewelry":
        return json.dumps(FALLBACK_JEWELRY)
    return json.dumps({"items": []})
