from pydantic import BaseModel, Field
from typing import Literal

class TierPrices(BaseModel):
    budget: int
    balanced: int
    premium: int

class PlanItem(BaseModel):
    id: str
    name: str
    description: str
    category: str
    quantity: int = Field(ge=1, le=500)
    priority: int = Field(ge=1, le=3)
    tier_prices: TierPrices
    reason: str
    search_terms: str
    tier: Literal["budget", "balanced", "premium"] = "balanced"
    source_type: str = "ai"
    links: list[dict] = []
    match_score: int | None = None

class CategoryTotal(BaseModel):
    category: str
    allocated: int
    percent_of_budget: float

class PlanResult(BaseModel):
    total_budget: int
    allocated: int
    remaining: int
    categories: list[CategoryTotal]
    items: list[PlanItem]
    warnings: list[str] = []
    contingency: int = 0
    guests: int | None = None
    per_guest_cost: int | None = None
    outfit_analysis: dict | None = None
    checklist: list[dict] = []
