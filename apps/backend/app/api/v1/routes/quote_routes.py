from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import httpx

from app.db.postgres.session import get_db
from app.controllers.quote_controller import QuoteController
from app.schemas.quote_schema import (
    QuoteCalculateRequest,
    QuoteCalculateResponse,
    MultiQuoteRequest,
    ComparisonResponse,
    RecommendationResponse,
)
from app.services.comparison.comparison_engine import compare_quotes
from app.services.recommendation.recommendation_engine import generate_recommendation
from app.services.idv_calculator import calculate_idv
from app.services.ncb_calculator import calculate_ncb
from app.core.config import settings

router = APIRouter(prefix="/quotes", tags=["quotes"])


@router.post("/calculate", response_model=QuoteCalculateResponse)
def calculate_quote(payload: QuoteCalculateRequest, db: Session = Depends(get_db)):
    controller = QuoteController(db)
    return controller.calculate(payload)


@router.post("/multi-quote", response_model=ComparisonResponse)
async def multi_quote(payload: MultiQuoteRequest):
    automation_url = settings.AUTOMATION_SERVICE_URL

    request_body = {
        "insurer_codes": payload.insurer_codes,
        "quote_request": {
            "customer_name": payload.customer_name,
            "vehicle_registration": payload.vehicle_registration,
            "idv": payload.idv,
            "vehicle_age_years": payload.vehicle_age_years,
            "ncb_percent": payload.ncb_percent,
            "engine_capacity_cc": payload.engine_capacity_cc,
            "has_anti_theft": payload.has_anti_theft,
            "product_id": 1,
            "addon_ids": payload.addon_ids,
        },
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(f"{automation_url}/automation/run", json=request_body)
            resp.raise_for_status()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"Automation service error: {e}")

    data = resp.json()
    results = data.get("results", [])

    quotes_for_comparison = []
    for r in results:
        if r.get("status") == "error":
            continue
        quotes_for_comparison.append({
            "insurer_code": r["insurer_code"],
            "insurer_name": r["insurer_name"],
            "product_name": r["product_name"],
            "final_premium": r["final_premium"],
            "idv": payload.idv,
            "deductible": payload.deductible,
            "addon_count": len(r.get("selected_addons", [])),
            "selected_addons": r.get("selected_addons", []),
            "breakdown": r.get("breakdown", []),
        })

    ranked = compare_quotes(quotes_for_comparison)
    return ComparisonResponse(quotes=ranked)


@router.post("/multi-quote/recommend", response_model=RecommendationResponse)
async def multi_quote_recommend(payload: MultiQuoteRequest):
    automation_url = settings.AUTOMATION_SERVICE_URL

    request_body = {
        "insurer_codes": payload.insurer_codes,
        "quote_request": {
            "customer_name": payload.customer_name,
            "vehicle_registration": payload.vehicle_registration,
            "idv": payload.idv,
            "vehicle_age_years": payload.vehicle_age_years,
            "ncb_percent": payload.ncb_percent,
            "engine_capacity_cc": payload.engine_capacity_cc,
            "has_anti_theft": payload.has_anti_theft,
            "product_id": 1,
            "addon_ids": payload.addon_ids,
        },
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(f"{automation_url}/automation/run", json=request_body)
            resp.raise_for_status()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"Automation service error: {e}")

    data = resp.json()
    results = data.get("results", [])

    quotes_for_comparison = []
    for r in results:
        if r.get("status") == "error":
            continue
        quotes_for_comparison.append({
            "insurer_code": r["insurer_code"],
            "insurer_name": r["insurer_name"],
            "product_name": r["product_name"],
            "final_premium": r["final_premium"],
            "idv": payload.idv,
            "deductible": payload.deductible,
            "addon_count": len(r.get("selected_addons", [])),
            "selected_addons": r.get("selected_addons", []),
            "breakdown": r.get("breakdown", []),
        })

    ranked = compare_quotes(quotes_for_comparison)
    recommendation = generate_recommendation(ranked)
    return RecommendationResponse(**recommendation)


@router.post("/calculate-idv")
def calculate_idv_endpoint(
    invoice_value: float,
    vehicle_age_years: int,
    adjustments: float = 0.0,
):
    result = calculate_idv(
        invoice_value=invoice_value,
        vehicle_age_years=vehicle_age_years,
        adjustments=adjustments,
    )
    return result


@router.post("/calculate-ncb")
def calculate_ncb_endpoint(
    claim_free_years: int,
    previous_ncb_percent: float = 0.0,
    had_claim_last_year: bool = False,
):
    result = calculate_ncb(
        claim_free_years=claim_free_years,
        previous_ncb_percent=previous_ncb_percent,
        had_claim_last_year=had_claim_last_year,
    )
    return result
