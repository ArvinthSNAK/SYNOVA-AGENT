from sqlalchemy import Column, Integer, String, Text, Float, Boolean
from app.db.postgres.base import Base, TimestampMixin


class PricingFactor(Base, TimestampMixin):
    __tablename__ = "pricing_factors"

    id = Column(Integer, primary_key=True)
    code = Column(String(100), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    factor_type = Column(String(50))
    value = Column(Float, nullable=True)
    active = Column(Boolean, default=True, nullable=False)
