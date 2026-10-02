def build_prompt(inputs: dict) -> str:
    return f"""
You are an expert Indian party planner.
Market: India. Currency: INR (₹). Use Indian platforms (Swiggy, Zomato, BookMyShow).
Create a plan for:
Budget: ₹{inputs.get('total_budget')}
Guests: {inputs.get('guests')}
Event Type: {inputs.get('event_type')}
Venue Type: {inputs.get('venue_type')}
Needs: {inputs.get('needs')}
User notes: "{inputs.get('notes', '')}"

RULES:
- Return ITEMS ONLY. NEVER produce totals, allocations, or remaining budget.
- Each item must have: name, description, category (venue, catering, decor, entertainment), quantity, priority (1=must-have to 3=nice-to-have), tier_prices (budget, balanced, premium in integer INR), reason, search_terms.
- Include a day-of checklist (short list of tasks with a suggested time label).
- Return strict JSON matching this example format:
{{
  "items": [
    {{
      "name": "Catering for 50",
      "description": "Buffet setup",
      "category": "catering",
      "quantity": 50,
      "priority": 1,
      "tier_prices": {{"budget": 300, "balanced": 500, "premium": 800}},
      "reason": "Food is essential",
      "search_terms": "catering services"
    }}
  ],
  "checklist": [
    {{"task": "Confirm venue setup", "time": "10:00 AM"}}
  ]
}}
"""
