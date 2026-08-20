from sqlalchemy import Column, Integer, String, Boolean, Text
from app.db.postgres.base import Base, TimestampMixin


class InsurerProvider(Base, TimestampMixin):
    __tablename__ = "insurer_providers"

    id = Column(Integer, primary_key=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    website_url = Column(String(500), nullable=True)
    automation_enabled = Column(Boolean, default=True)
    api_endpoint = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    active = Column(Boolean, default=True)
