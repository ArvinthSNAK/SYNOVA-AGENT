from sqlalchemy import Column, Integer, String, Float, Boolean, JSON
from app.db import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    insurance_type = Column(String(50), nullable=False, default="motor")
    base_rate_percent = Column(Float, nullable=False)  # e.g. 3.0 means 3% of IDV
    active = Column(Boolean, nullable=False, default=True)


class PricingRule(Base):
    __tablename__ = "pricing_rules"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, nullable=False)
    name = Column(String(255), nullable=False)
    rule_type = Column(String(50), nullable=False)  # base | loading | discount | tax | addon
    # Expression is a small JSON tree, same style as your main backend's evaluator:
    # e.g. {"op": "mul", "args": [{"var": "idv"}, {"const": 0.03}]}
    expression = Column(JSON, nullable=False)
    priority = Column(Integer, nullable=False, default=100)
    active = Column(Boolean, nullable=False, default=True)


class AddOn(Base):
    __tablename__ = "add_ons"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, nullable=False)
    name = Column(String(255), nullable=False)
    premium_flat_amount = Column(Float, nullable=False, default=0.0)
    active = Column(Boolean, nullable=False, default=True)