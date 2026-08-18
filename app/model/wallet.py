from sqlalchemy import Column, Integer, String, Float
from app.database import Base


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    policy_number = Column(String, nullable=False)
    insurer_name = Column(String, nullable=False)
    policy_type = Column(String, nullable=False)
    premium = Column(Float, nullable=False)
    status = Column(String, default="active")