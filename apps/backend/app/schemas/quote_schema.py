from pydantic import BaseModel, Field
from typing import Optional, Any, Dict, List


class QuoteCalculateRequest(BaseModel):
    product_id: int
    application_id: Optional[int] = None
    customer_id: Optional[int] = None
    vehicle: Dict[str, Any] = Field(default_factory=dict)
    customer: Dict[str, Any] = Field(default_factory=dict)
    driver: Dict[str, Any] = Field(default_factory=dict)
    save: bool = True  # if False, calculate only — don't persist a Quote row


class QuoteBreakdownItem(BaseModel):
    rule: str
    rule_type: str
    value: float
    running_total: float


class QuoteCalculateResponse(BaseModel):
    quote_id: Optional[int] = None
    insurer_id: int
    product_id: int
    final_premium: float
    status: str
    breakdown: List[QuoteBreakdownItem]

    class Config:
        from_attributes = True