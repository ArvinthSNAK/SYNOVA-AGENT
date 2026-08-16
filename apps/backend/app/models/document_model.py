from sqlalchemy import Column, Integer, String, DateTime
from app.db.postgres.base import Base, TimestampMixin


class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, nullable=True)
    original_filename = Column(String(255), nullable=False)
    stored_path = Column(String(500), nullable=False)
    content_type = Column(String(100), nullable=True)
    document_type = Column(String(50), nullable=False, server_default="policy_pdf")
    status = Column(String(50), nullable=False, server_default="uploaded")
    analyzed_at = Column(DateTime(timezone=True), nullable=True)