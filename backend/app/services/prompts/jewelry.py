def build_prompt(inputs: dict) -> str:
    return f"""
You are an expert Indian jewelry stylist.
Market: India. Currency: INR (₹). Use Indian brands (Bluestone, Tanishq, CaratLane).
Create a plan for:
Budget: ₹{inputs.get('total_budget')}
Occasion: {inputs.get('occasion')}
Style: {inputs.get('style')}
User notes: "{inputs.get('notes', '')}"

RULES:
- Return ITEMS ONLY. NEVER produce totals or allocations.
- If an image is provided, provide outfit_analysis (colors array, style, formality). If no image, guess based on occasion.
- Each item must have: name, description, category (jewelry), quantity, priority (1-3), tier_prices (budget, balanced, premium in integer INR), reason, search_terms.
- Include specific colour/metal/style tags in the search_terms and description.
- Return strict JSON matching this example format:
{{
  "items": [
    {{
      "name": "Gold Plated Jhumkas",
      "description": "Traditional gold jhumkas",
      "category": "jewelry",
      "quantity": 1,
      "priority": 1,
      "tier_prices": {{"budget": 1000, "balanced": 2500, "premium": 5000}},
      "reason": "Matches the ethnic look",
      "search_terms": "gold plated jhumkas traditional"
    }}
  ],
  "outfit_analysis": {{
    "colors": ["red", "gold"],
    "style": "traditional",
    "formality": "high"
  }}
}}
"""
