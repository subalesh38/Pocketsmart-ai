from pydantic import BaseModel, Field
from typing import Literal

class PartyPlanInput(BaseModel):
    total_budget: int = Field(ge=1000, le=10000000)
    guests: int = Field(ge=1, le=1000)
    party_type: Literal["birthday", "corporate", "wedding", "anniversary", "other"]
    venue_type: str = Field(min_length=1)
    needs: str = Field(min_length=1)
    notes: str = Field(default="", max_length=500)
