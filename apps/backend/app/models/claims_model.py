from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from app.db.postgres.base import Base, TimestampMixin


class Claim(Base, TimestampMixin):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    claim_number = Column(String(100), unique=True, nullable=False)
    claim_amount = Column(Float, nullable=False)
    approved_amount = Column(Float, nullable=True)
    status = Column(String(50), default="submitted")
    incident_date = Column(DateTime, nullable=True)
    description = Column(Text, nullable=True)
    active = Column(Boolean, default=True)
