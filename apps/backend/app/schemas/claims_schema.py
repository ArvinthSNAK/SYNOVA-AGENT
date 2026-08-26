from typing import Optional, List
from pydantic import BaseModel


class FNOLRequest(BaseModel):
    policy_id: int
    customer_id: Optional[int] = 1
    claim_type: str = "Accidental Damage"
    incident_date: Optional[str] = None
    incident_location: str = "Bangalore, Indiranagar"
    description: str = ""
    estimated_loss: float = 25000.0
    garage_name: Optional[str] = "Authorized Cashless Service Hub"
    garage_city: Optional[str] = "Bangalore"
    documents: Optional[List[str]] = []


class ClaimStatusUpdateRequest(BaseModel):
    status: str
    approved_amount: Optional[float] = None
    surveyor_notes: Optional[str] = None
