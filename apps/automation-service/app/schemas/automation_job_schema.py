from pydantic import BaseModel
from typing import Optional


class QuoteRequest(BaseModel):
    customer_name: str
    vehicle_registration: str
    idv: float
    vehicle_age_years: int = 0
    ncb_percent: float = 0
    engine_capacity_cc: int = 1200
    has_anti_theft: int = 0
    product_id: int = 1
    addon_ids: list[int] = []


class AutomationJobRequest(BaseModel):
    insurer_codes: list[str]
    quote_request: QuoteRequest


class QuoteResult(BaseModel):
    insurer_code: str
    insurer_name: str
    product_name: str
    final_premium: float
    breakdown: list[dict]
    selected_addons: list[str]
    status: str = "success"
    error: Optional[str] = None


class AutomationJobResponse(BaseModel):
    job_id: str
    status: str
    results: list[QuoteResult] = []
