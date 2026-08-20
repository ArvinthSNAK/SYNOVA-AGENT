from sqlalchemy import Column, Integer, ForeignKey, Float, String, JSON
from sqlalchemy.orm import relationship
from app.db.postgres.base import Base, TimestampMixin


class Quote(Base, TimestampMixin):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True)
    application_id = Column(Integer, nullable=True)
    customer_id = Column(Integer, nullable=True)
    insurer_id = Column(Integer, ForeignKey("insurers.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("insurance_products.id"), nullable=False)
    total_premium = Column(Float, nullable=False)
    idv = Column(Float, nullable=True)
    deductible = Column(Float, nullable=True)
    metadata_json = Column("metadata", JSON)
    status = Column(String(50), default="draft")

    items = relationship("QuoteItem", back_populates="quote", cascade="all, delete-orphan")
    insurer = relationship("Insurer")
    product = relationship("InsuranceProduct")
