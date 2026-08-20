from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from app.db.postgres.base import Base, TimestampMixin


class Policy(Base, TimestampMixin):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    insurer_id = Column(Integer, nullable=True)
    product_id = Column(Integer, nullable=True)
    policy_number = Column(String(100), nullable=True)
    insurance_type = Column(String(50), nullable=False, default="motor")
    insurer_name = Column(String(255), nullable=True)
    product_name = Column(String(255), nullable=True)
    status = Column(String(50), default="active")
    premium = Column(Float, nullable=True)
    idv = Column(Float, nullable=True)
    coverage_amount = Column(Float, nullable=True)
    deductible = Column(Float, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    vehicle_registration = Column(String(50), nullable=True)
    vehicle_make = Column(String(100), nullable=True)
    vehicle_model = Column(String(100), nullable=True)
    ncb_percent = Column(Float, nullable=True)
    addons = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    active = Column(Boolean, default=True)
