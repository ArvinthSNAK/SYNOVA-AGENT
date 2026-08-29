from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON
from app.db.postgres.base import Base, TimestampMixin


class PaymentOrder(Base, TimestampMixin):
    __tablename__ = "payment_orders"

    id = Column(Integer, primary_key=True)
    order_id = Column(String(100), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    product_id = Column(Integer, nullable=True)
    product_name = Column(String(255), nullable=True)
    insurer_name = Column(String(255), nullable=True)
    category = Column(String(50), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(50), default="created")  # created, processing, success, failed, cancelled, refunded
    payment_method = Column(String(50), nullable=True)  # upi, card, netbanking, wallet
    gateway_order_id = Column(String(150), nullable=True)
    application_data = Column(JSON, nullable=True)
    active = Column(Boolean, default=True)


class PaymentTransaction(Base, TimestampMixin):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True)
    transaction_id = Column(String(100), unique=True, nullable=False, index=True)
    order_id = Column(String(100), ForeignKey("payment_orders.order_id"), nullable=False)
    payment_id = Column(String(150), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(50), default="success")  # pending, success, failed
    gateway_response = Column(JSON, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    policy_id = Column(Integer, nullable=True)
    policy_number = Column(String(100), nullable=True)
