import json

def build_prompt(inputs: dict) -> str:
    return f"""
You are an expert Indian home planner.
Market: India. Currency: INR (₹). Use Indian brands and platforms.
Create a plan for:
Budget: ₹{inputs.get('total_budget')}
Rooms: {inputs.get('rooms')}
Counts - Lights: {inputs.get('lights', 0)}, Fans: {inputs.get('fans', 0)}, Furniture: {inputs.get('furniture', 0)}, Dining: {inputs.get('dining_tables', 0)}
User notes: "{inputs.get('notes', '')}"

RULES:
- Return ITEMS ONLY. NEVER produce totals, allocations, or remaining budget.
- Each item must have: name, description, category, quantity, priority (1=must-have, 2=important, 3=nice-to-have), tier_prices (budget, balanced, premium in integer INR), reason, search_terms.
- Return strict JSON matching this example format:
{{
  "items": [
    {{
      "name": "Ceiling Fan",
      "description": "Standard 1200mm fan",
      "category": "ceiling_fans",
      "quantity": 2,
      "priority": 1,
      "tier_prices": {{
        "budget": 1500,
        "balanced": 2500,
        "premium": 4000
      }},
      "reason": "Essential for bedrooms",
      "search_terms": "1200mm ceiling fan"
    }}
  ]
}}
"""
