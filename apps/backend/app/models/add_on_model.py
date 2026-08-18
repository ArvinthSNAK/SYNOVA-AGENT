from sqlalchemy import Column, Integer, String, Text, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.postgres.base import Base, TimestampMixin


class AddOn(Base, TimestampMixin):
    __tablename__ = "add_ons"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("insurance_products.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    premium_calculation_method = Column(String(50), default="flat")
    flat_amount = Column(Float, nullable=True)
    premium_factor = Column(Float, nullable=True)
    eligibility = Column(Text)
    coverage_limit = Column(Float, nullable=True)
    exclusions = Column(Text)
    active = Column(Boolean, default=True, nullable=False)

    product = relationship("InsuranceProduct", back_populates="addons")
