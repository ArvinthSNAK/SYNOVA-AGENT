from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from app.db.postgres.base import Base, TimestampMixin


class Renewal(Base, TimestampMixin):
    __tablename__ = "renewals"

    id = Column(Integer, primary_key=True)
    previous_policy_id = Column(Integer, ForeignKey("policies.id"), nullable=True)
    new_policy_id = Column(Integer, ForeignKey("policies.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    renewal_status = Column(String(50), default="pending")
    renewal_date = Column(DateTime, nullable=True)
    previous_premium = Column(Float, nullable=True)
    new_premium = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
