from sqlalchemy import Column, Integer, String, Text, Boolean
from app.db.postgres.base import Base, TimestampMixin


class CoverageType(Base, TimestampMixin):
    __tablename__ = "coverage_types"

    id = Column(Integer, primary_key=True)
    code = Column(String(100), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    active = Column(Boolean, default=True, nullable=False)
