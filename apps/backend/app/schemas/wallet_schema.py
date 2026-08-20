from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PolicySummary(BaseModel):
    id: int
    insurance_type: str
    insurer_name: Optional[str] = None
    product_name: Optional[str] = None
    policy_number: Optional[str] = None
    status: str
    premium: Optional[float] = None
    idv: Optional[float] = None
    coverage_amount: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    vehicle_registration: Optional[str] = None

    class Config:
        from_attributes = True


class InsuranceVaultResponse(BaseModel):
    customer_id: int
    total_policies: int
    active_count: int
    expiring_soon_count: int
    expired_count: int
    policies_by_type: dict[str, List[PolicySummary]]
