from sqlalchemy import Column, Integer, String, Text, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.postgres.base import Base, TimestampMixin


class InsuranceProduct(Base, TimestampMixin):
    __tablename__ = "insurance_products"

    id = Column(Integer, primary_key=True)
    insurer_id = Column(Integer, ForeignKey("insurers.id"), nullable=False)
    name = Column(String(255), nullable=False)
    insurance_type = Column(String(50), nullable=False)
    description = Column(Text)
    base_rate = Column(Float, nullable=True)
    minimum_premium = Column(Float, nullable=True)
    maximum_premium = Column(Float, nullable=True)
    active = Column(Boolean, default=True, nullable=False)

    insurer = relationship("Insurer", back_populates="products")
    coverages = relationship("ProductCoverage", back_populates="product", cascade="all, delete-orphan")
    addons = relationship("AddOn", back_populates="product", cascade="all, delete-orphan")
    pricing_rules = relationship("PricingRule", back_populates="product", cascade="all, delete-orphan")
