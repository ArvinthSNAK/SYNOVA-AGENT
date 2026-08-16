from sqlalchemy import Column, Integer, ForeignKey, Float, Text, Boolean
from sqlalchemy.orm import relationship
from app.db.postgres.base import Base, TimestampMixin


class ProductCoverage(Base, TimestampMixin):
    __tablename__ = "product_coverages"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("insurance_products.id"), nullable=False)
    coverage_type_id = Column(Integer, ForeignKey("coverage_types.id"), nullable=False)
    limit = Column(Float, nullable=True)
    exclusion = Column(Text)
    active = Column(Boolean, default=True, nullable=False)

    product = relationship("InsuranceProduct", back_populates="coverages")
    coverage = relationship("CoverageType")
