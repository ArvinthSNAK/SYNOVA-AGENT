from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from app.db.postgres.base import Base, TimestampMixin


class Application(Base, TimestampMixin):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    insurance_type = Column(String(50), nullable=False, default="motor")
    application_type = Column(String(50), nullable=False, default="new")
    status = Column(String(50), default="draft")
    data = Column(JSON, default={})
