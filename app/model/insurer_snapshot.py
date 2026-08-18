from sqlalchemy import Column, Integer, String, Text

from app.database import Base


class InsurerSnapshot(Base):
    __tablename__ = "insurer_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    insurer_id = Column(String, unique=True, nullable=False)
    data = Column(Text, nullable=False)