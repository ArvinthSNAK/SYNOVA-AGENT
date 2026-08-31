from typing import Dict, Any, Optional
from pydantic import BaseModel


class CreateOrderRequest(BaseModel):
    product_id: Optional[Any] = 1
    amount: float
    customer_id: Optional[int] = 1
    payment_method: Optional[str] = "upi"
    application_data: Optional[Dict[str, Any]] = None


class VerifyPaymentRequest(BaseModel):
    order_id: str
    payment_id: Optional[str] = None
    signature: Optional[str] = None
    simulated_status: Optional[str] = "success"  # success, failed
