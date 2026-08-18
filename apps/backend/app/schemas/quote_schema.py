from pydantic import BaseModel, Field
from typing import Optional, Any, Dict, List


class QuoteCalculateRequest(BaseModel):
    product_id: int
    application_id: Optional[int] = None
    customer_id: Optional[int] = None
    vehicle: Dict[str, Any] = Field(default_factory=dict)
    customer: Dict[str, Any] = Field(default_factory=dict)
    driver: Dict[str, Any] = Field(default_factory=dict)
    save: bool = True


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


class MultiQuoteRequest(BaseModel):
    customer_name: str
    vehicle_registration: str
    idv: float
    vehicle_age_years: int = 0
    ncb_percent: float = 0
    engine_capacity_cc: int = 1200
    has_anti_theft: int = 0
    insurer_codes: List[str] = ["insurer_a", "insurer_b", "insurer_c", "insurer_d"]
    deductible: float = 2000.0
    addon_ids: List[int] = []


class QuoteScores(BaseModel):
    price: float
    coverage: float
    idv: float
    deductible: float
    addons: float
    benefits: float
    overall: float


class ComparedQuote(BaseModel):
    insurer_code: str
    insurer_name: str
    product_name: str
    final_premium: float
    idv: float = 0
    deductible: float = 0
    addon_count: int = 0
    selected_addons: List[str] = []
    breakdown: List[dict] = []
    scores: QuoteScores
    rank: int


class ComparisonResponse(BaseModel):
    quotes: List[ComparedQuote]


class RecommendedPolicy(BaseModel):
    insurer_code: str
    insurer_name: str
    product_name: str
    final_premium: float
    overall_score: float


class OtherPolicy(BaseModel):
    insurer_code: str
    insurer_name: str
    product_name: str
    final_premium: float
    overall_score: float
    rank: int
    why_lower: List[str]


class RecommendationResponse(BaseModel):
    recommended_policy: RecommendedPolicy
    why_recommended: List[str]
    tradeoffs: List[str]
    coverage_gaps: List[str]
    other_policies: List[OtherPolicy]
    disclaimer: str
