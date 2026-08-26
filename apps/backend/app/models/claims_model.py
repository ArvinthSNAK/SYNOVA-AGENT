from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from app.db.postgres.base import Base, TimestampMixin


class Claim(Base, TimestampMixin):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True)
    claim_number = Column(String(100), unique=True, nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    claim_type = Column(String(100), default="Accidental Damage")
    status = Column(String(50), default="SUBMITTED")  # SUBMITTED, UNDER_REVIEW, SURVEYOR_ASSIGNED, ESTIMATE_APPROVED, REPAIR_IN_PROGRESS, SETTLED, REJECTED
    
    incident_date = Column(DateTime, nullable=True)
    incident_location = Column(String(255), default="")
    description = Column(Text, nullable=True)
    
    estimated_loss = Column(Float, nullable=False, default=0.0)
    approved_amount = Column(Float, nullable=True, default=0.0)
    deductible_applied = Column(Float, nullable=True, default=0.0)
    net_payout = Column(Float, nullable=True, default=0.0)
    
    surveyor_name = Column(String(255), nullable=True)
    surveyor_contact = Column(String(50), nullable=True)
    surveyor_notes = Column(Text, nullable=True)
    
    garage_name = Column(String(255), nullable=True)
    garage_city = Column(String(100), nullable=True)
    
    documents_json = Column(JSON, default=list)
    active = Column(Boolean, default=True)
