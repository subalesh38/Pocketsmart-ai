from pydantic import BaseModel
from datetime import datetime

class HistoryListItem(BaseModel):
    id: str
    type: str
    created_at: datetime
    total_budget: int
    allocated: int
    remaining: int
    summary: str
    has_image: bool
