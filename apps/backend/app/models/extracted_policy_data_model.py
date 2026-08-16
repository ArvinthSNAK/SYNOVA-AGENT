from sqlalchemy import Column, Integer, ForeignKey, String, JSON, Text, DateTime, Float
from app.db.postgres.base import Base, TimestampMixin


class ExtractedPolicyData(Base, TimestampMixin):
    __tablename__ = "extracted_policy_data"

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    customer_name = Column(String(255))
    policy_number = Column(String(255))
    insurer_name = Column(String(255))
    policy_type = Column(String(100))
    vehicle_registration = Column(String(50))
    vehicle_make = Column(String(100))
    vehicle_model = Column(String(100))
    idv = Column(Float, nullable=True)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    premium = Column(Float, nullable=True)
    ncb = Column(String(50))
    raw_text = Column(Text)
    raw = Column(JSON)