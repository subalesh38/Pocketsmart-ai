import uuid
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.types import JSON
from app.db.session import Base
from sqlalchemy.orm import relationship

class Plan(Base):
    __tablename__ = "plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String, nullable=False)
    input_json = Column(JSON)
    result_json = Column(JSON)
    total_budget = Column(Integer, nullable=False)
    allocated = Column(Integer, nullable=False, default=0)
    remaining = Column(Integer, nullable=False, default=0)
    has_image = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="plans")

    __table_args__ = (
        Index("ix_plans_user_id_created_at_desc", "user_id", created_at.desc()),
    )
