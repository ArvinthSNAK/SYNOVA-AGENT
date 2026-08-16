from pydantic import BaseModel, Field
from typing import Optional, Any


class InsurerCreate(BaseModel):
    name: str = Field(...)
    description: Optional[str]
    active: Optional[bool] = True


class InsuranceProductCreate(BaseModel):
    insurer_id: int
    name: str
    insurance_type: str
    description: Optional[str]
    base_rate: Optional[float]
    minimum_premium: Optional[float]
    maximum_premium: Optional[float]
    active: Optional[bool] = True


class PricingRuleCreate(BaseModel):
    product_id: int
    name: str
    rule_type: Optional[str]
    expression: Optional[Any]
    priority: Optional[int] = 100
    active: Optional[bool] = True
