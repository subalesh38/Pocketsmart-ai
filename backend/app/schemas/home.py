from pydantic import BaseModel, Field

class HomePlanInput(BaseModel):
    total_budget: int = Field(ge=1000, le=10000000)
    rooms: str
    lights: int = Field(default=0, ge=0, le=50)
    fans: int = Field(default=0, ge=0, le=50)
    furniture: int = Field(default=0, ge=0, le=50)
    dining_tables: int = Field(default=0, ge=0, le=50)
    notes: str = Field(default="", max_length=500)
