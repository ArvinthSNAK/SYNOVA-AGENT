from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.orm import relationship
from app.db.postgres.base import Base, TimestampMixin


class Insurer(Base, TimestampMixin):
    __tablename__ = "insurers"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, unique=True)
    code = Column(String(50), unique=True, nullable=True)
    description = Column(Text)
    active = Column(Boolean, default=True, nullable=False)

    products = relationship("InsuranceProduct", back_populates="insurer", cascade="all, delete-orphan")
