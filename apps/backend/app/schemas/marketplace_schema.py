from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class CategoryItem(BaseModel):
    id: str
    name: str
    tagline: str
    icon: str
    product_count: int
    features: List[str]
    starting_price: str


class ProductFilterRequest(BaseModel):
    category: Optional[str] = None
    insurer_id: Optional[int] = None
    min_premium: Optional[float] = None
    max_premium: Optional[float] = None
    min_coverage: Optional[float] = None
    maternity_only: Optional[bool] = None
    opd_only: Optional[bool] = None
    critical_illness_only: Optional[bool] = None
    sort_by: Optional[str] = "recommended"
    limit: Optional[int] = 50
    offset: Optional[int] = 0


class ProductCompareRequest(BaseModel):
    product_ids: List[int] = Field(..., min_items=2, max_items=4)


class NaturalLanguageSearchRequest(BaseModel):
    query: str


class HealthQuoteRequest(BaseModel):
    product_id: int
    proposer_age: int = 30
    member_count: int = 1
    sum_insured: float = 500000.0
    has_pre_existing_disease: bool = False
    city_tier: int = 1
    selected_addon_ids: Optional[List[int]] = None


class TermQuoteRequest(BaseModel):
    product_id: int
    age: int = 30
    gender: str = "male"
    is_smoker: bool = False
    annual_income: float = 1000000.0
    sum_assured: float = 10000000.0
    policy_term_years: int = 30
    selected_riders: Optional[List[str]] = None
