from sqlalchemy import Column, Integer, ForeignKey, String, Text, DateTime, Boolean, JSON
from app.db.postgres.base import Base, TimestampMixin


class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, nullable=True)
    notification_type = Column(String(100))
    subject = Column(String(255))
    message = Column(Text)
    metadata_json = Column("metadata", JSON)
    status = Column(String(50), default="pending")
    sent_at = Column(DateTime)
    active = Column(Boolean, default=True)
