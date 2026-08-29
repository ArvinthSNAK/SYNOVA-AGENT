from sqlalchemy import Column, Integer, String, Text, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.postgres.base import Base, TimestampMixin


class InsuranceProduct(Base, TimestampMixin):
    __tablename__ = "insurance_products"

    id = Column(Integer, primary_key=True)
    insurer_id = Column(Integer, ForeignKey("insurers.id"), nullable=False)
    name = Column(String(255), nullable=False)
    insurance_type = Column(String(50), nullable=False)  # motor, health, term
    category = Column(String(50), nullable=True)  # motor, health, term
    description = Column(Text)
    
    # Financial & Pricing Defaults
    base_rate = Column(Float, nullable=True)
    minimum_premium = Column(Float, nullable=True)
    maximum_premium = Column(Float, nullable=True)
    coverage_amount_min = Column(Float, nullable=True)
    coverage_amount_max = Column(Float, nullable=True)
    default_coverage_amount = Column(Float, nullable=True)
    premium_frequency = Column(String(50), default="monthly")  # monthly, annual
    
    # Ratings & Underwriting Metrics
    rating = Column(Float, default=4.7)
    claim_settlement_ratio = Column(String(50), default="98.2%")
    
    # Health Specific Attributes
    cashless_hospitals_count = Column(Integer, default=0)
    waiting_period_months = Column(Integer, default=0)
    maternity_covered = Column(Boolean, default=False)
    opd_covered = Column(Boolean, default=False)
    critical_illness_covered = Column(Boolean, default=False)
    room_rent_limit = Column(String(100), default="No Limit / Single Private Room")
    plan_type = Column(String(50), default="Individual & Family Floater")
    
    # Term Life Specific Attributes
    smoker_allowed = Column(Boolean, default=True)
    max_entry_age = Column(Integer, default=65)
    policy_terms_available = Column(Text, default="[10, 15, 20, 25, 30, 35, 40]")
    
    # Rich Feature & Rider Lists (Stored as JSON / Text)
    features_json = Column(JSON, nullable=True)
    exclusions_json = Column(JSON, nullable=True)
    riders_json = Column(JSON, nullable=True)
    
    active = Column(Boolean, default=True, nullable=False)

    insurer = relationship("Insurer", back_populates="products")
    coverages = relationship("ProductCoverage", back_populates="product", cascade="all, delete-orphan")
    addons = relationship("AddOn", back_populates="product", cascade="all, delete-orphan")
    pricing_rules = relationship("PricingRule", back_populates="product", cascade="all, delete-orphan")
