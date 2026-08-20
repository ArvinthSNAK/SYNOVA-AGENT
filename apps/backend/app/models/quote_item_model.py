from sqlalchemy import Column, Integer, ForeignKey, String, Float, JSON
from sqlalchemy.orm import relationship
from app.db.postgres.base import Base, TimestampMixin


class QuoteItem(Base, TimestampMixin):
    __tablename__ = "quote_items"

    id = Column(Integer, primary_key=True)
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=False)
    code = Column(String(100), nullable=False)
    description = Column(String(255))
    amount = Column(Float, nullable=False)
    meta = Column(JSON)

    quote = relationship("Quote", back_populates="items")
