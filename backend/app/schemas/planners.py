from pydantic import BaseModel
from typing import Literal

class RecalculateInput(BaseModel):
    item_id: str
    tier: Literal["budget", "balanced", "premium"]
