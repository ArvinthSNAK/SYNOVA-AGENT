from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.postgres.base import Base, TimestampMixin


class PricingRule(Base, TimestampMixin):
    __tablename__ = "pricing_rules"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("insurance_products.id"), nullable=False)
    name = Column(String(255), nullable=False)
    rule_type = Column(String(50))
    expression = Column(JSON)
    priority = Column(Integer, default=100)
    active = Column(Boolean, default=True, nullable=False)

    product = relationship("InsuranceProduct", back_populates="pricing_rules")
