from sqlalchemy import Column, Integer, ForeignKey, String, JSON, DateTime
from app.db.postgres.base import Base, TimestampMixin


class PolicyVersion(Base, TimestampMixin):
    __tablename__ = "policy_versions"

    id = Column(Integer, primary_key=True)
    policy_id = Column(Integer, nullable=False)
    version = Column(Integer, nullable=False)
    data = Column(JSON)
    effective_from = Column(DateTime)
    effective_to = Column(DateTime)
