from pydantic import BaseModel, Field

class AITierPrices(BaseModel):
    budget: int = Field(gt=0)
    balanced: int = Field(gt=0)
    premium: int = Field(gt=0)

class AIItem(BaseModel):
    name: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    quantity: int = Field(ge=1, le=500)
    priority: int = Field(ge=1, le=3)
    tier_prices: AITierPrices
    reason: str = Field(..., min_length=1)
    search_terms: str = Field(..., min_length=1)

class AIHomeResult(BaseModel):
    items: list[AIItem]

class AIChecklistItem(BaseModel):
    task: str = Field(..., min_length=1)
    time: str = Field(..., min_length=1)

class AIPartyResult(BaseModel):
    items: list[AIItem]
    checklist: list[AIChecklistItem]

class AIOutfitAnalysis(BaseModel):
    colors: list[str]
    style: str
    formality: str

class AIJewelryResult(BaseModel):
    items: list[AIItem]
    outfit_analysis: AIOutfitAnalysis
