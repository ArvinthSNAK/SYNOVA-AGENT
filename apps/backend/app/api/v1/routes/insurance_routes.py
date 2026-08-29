from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.postgres.session import get_db
from app.services.marketplace_service import (
    get_categories_overview,
    list_marketplace_products,
    get_product_details,
)
from app.services.natural_language_search_service import execute_natural_language_search
from app.services.health_term_calculator import calculate_health_quote, calculate_term_quote
from app.schemas.marketplace_schema import (
    ProductFilterRequest,
    ProductCompareRequest,
    NaturalLanguageSearchRequest,
    HealthQuoteRequest,
    TermQuoteRequest,
)

router = APIRouter(prefix="/insurance", tags=["insurance-marketplace"])


@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """Returns overview metadata and product counts for Motor, Health, and Term Life."""
    return get_categories_overview(db)


@router.get("/products")
def get_products(
    category: Optional[str] = Query(None, description="Category filter (motor, health, term)"),
    insurer_id: Optional[int] = Query(None),
    min_premium: Optional[float] = Query(None),
    max_premium: Optional[float] = Query(None),
    min_coverage: Optional[float] = Query(None),
    maternity: Optional[bool] = Query(None),
    opd: Optional[bool] = Query(None),
    critical_illness: Optional[bool] = Query(None),
    sort_by: str = Query("recommended", description="lowest_premium, highest_premium, highest_coverage, lowest_coverage, highest_rating, best_value, recommended"),
    limit: int = Query(50),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    """Lists insurance products with comprehensive filtering and sorting."""
    return list_marketplace_products(
        db,
        category=category,
        insurer_id=insurer_id,
        min_premium=min_premium,
        max_premium=max_premium,
        min_coverage=min_coverage,
        maternity_only=maternity,
        opd_only=opd,
        critical_illness_only=critical_illness,
        sort_by=sort_by,
        limit=limit,
        offset=offset,
    )


@router.get("/products/category/{category}")
def get_products_by_category(category: str, sort_by: str = "recommended", db: Session = Depends(get_db)):
    """Lists products filtered specifically by category (motor, health, term)."""
    return list_marketplace_products(db, category=category, sort_by=sort_by)


@router.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Returns detailed information for a specific insurance product."""
    details = get_product_details(db, product_id)
    if not details:
        raise HTTPException(status_code=404, detail=f"Insurance product {product_id} not found")
    return details


@router.post("/filter")
def filter_products(payload: ProductFilterRequest, db: Session = Depends(get_db)):
    """Post-based filtering endpoint for marketplace."""
    return list_marketplace_products(
        db,
        category=payload.category,
        insurer_id=payload.insurer_id,
        min_premium=payload.min_premium,
        max_premium=payload.max_premium,
        min_coverage=payload.min_coverage,
        maternity_only=payload.maternity_only,
        opd_only=payload.opd_only,
        critical_illness_only=payload.critical_illness_only,
        sort_by=payload.sort_by or "recommended",
        limit=payload.limit or 50,
        offset=payload.offset or 0,
    )


@router.post("/search")
def natural_language_search(payload: NaturalLanguageSearchRequest, db: Session = Depends(get_db)):
    """AI-powered natural language policy search and multi-factor ranking."""
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query string is required")
    return execute_natural_language_search(db, payload.query.strip())


@router.post("/compare")
def compare_selected_products(payload: ProductCompareRequest, db: Session = Depends(get_db)):
    """Compares 2-4 selected products side-by-side."""
    if len(payload.product_ids) < 2:
        raise HTTPException(status_code=400, detail="Select at least 2 products to compare")

    items = []
    for pid in payload.product_ids:
        det = get_product_details(db, pid)
        if det:
            items.append(det)

    if len(items) < 2:
        raise HTTPException(status_code=400, detail="Could not find valid products for comparison")

    return {
        "compared_count": len(items),
        "products": items,
    }


@router.post("/quote-calculator/health")
def calculate_health_quote_api(payload: HealthQuoteRequest, db: Session = Depends(get_db)):
    """Calculates dynamic health insurance premium based on age, members, sum insured, and add-ons."""
    try:
        return calculate_health_quote(
            db,
            product_id=payload.product_id,
            proposer_age=payload.proposer_age,
            member_count=payload.member_count,
            sum_insured=payload.sum_insured,
            has_pre_existing_disease=payload.has_pre_existing_disease,
            city_tier=payload.city_tier,
            selected_addon_ids=payload.selected_addon_ids,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/quote-calculator/term")
def calculate_term_quote_api(payload: TermQuoteRequest, db: Session = Depends(get_db)):
    """Calculates dynamic term life insurance premium based on age, smoking status, term, and riders."""
    try:
        return calculate_term_quote(
            db,
            product_id=payload.product_id,
            age=payload.age,
            gender=payload.gender,
            is_smoker=payload.is_smoker,
            annual_income=payload.annual_income,
            sum_assured=payload.sum_assured,
            policy_term_years=payload.policy_term_years,
            selected_riders=payload.selected_riders,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
