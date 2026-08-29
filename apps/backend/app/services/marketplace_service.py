from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc

from app.models.insurance_product_model import InsuranceProduct
from app.models.insurer_model import Insurer


def get_categories_overview(db: Session) -> List[Dict[str, Any]]:
    """Returns overview metadata and product counts for Motor, Health, and Term Life."""
    counts = {
        "motor": db.query(InsuranceProduct).filter(InsuranceProduct.insurance_type == "motor", InsuranceProduct.active == True).count(),
        "health": db.query(InsuranceProduct).filter(InsuranceProduct.insurance_type == "health", InsuranceProduct.active == True).count(),
        "term": db.query(InsuranceProduct).filter(InsuranceProduct.insurance_type == "term", InsuranceProduct.active == True).count(),
    }

    return [
        {
            "id": "motor",
            "name": "Motor Insurance",
            "tagline": "Protect your car & two-wheeler with cashless claims",
            "icon": "🚗",
            "product_count": counts["motor"],
            "features": ["Instant Zero-Dep Coverage", "24x7 Roadside Assistance", "Cashless Garage Network", "No Claim Bonus Transfer"],
            "starting_price": "₹499/mo",
        },
        {
            "id": "health",
            "name": "Health Insurance",
            "tagline": "Comprehensive medical & hospitalization cover for you & your family",
            "icon": "🏥",
            "product_count": counts["health"],
            "features": ["10,000+ Cashless Hospitals", "Maternity & Newborn Cover", "Pre & Post Hospitalization", "Zero Room Rent Capping"],
            "starting_price": "₹650/mo",
        },
        {
            "id": "term",
            "name": "Term Life Insurance",
            "tagline": "Financial security for your family's future up to ₹5 Crore",
            "icon": "🛡️",
            "product_count": counts["term"],
            "features": ["High Sum Assured up to ₹5 Cr", "Critical Illness Rider", "Accidental Death Benefit", "Tax Benefits under 80C"],
            "starting_price": "₹450/mo",
        },
    ]


def list_marketplace_products(
    db: Session,
    category: Optional[str] = None,
    insurer_id: Optional[int] = None,
    min_premium: Optional[float] = None,
    max_premium: Optional[float] = None,
    min_coverage: Optional[float] = None,
    maternity_only: Optional[bool] = None,
    opd_only: Optional[bool] = None,
    critical_illness_only: Optional[bool] = None,
    sort_by: str = "recommended",
    limit: int = 50,
    offset: int = 0,
) -> Dict[str, Any]:
    """Queries, filters, and sorts insurance products across categories."""
    query = db.query(InsuranceProduct).join(Insurer).filter(InsuranceProduct.active == True)

    if category:
        c_clean = category.strip().lower()
        if c_clean in ["motor", "car", "bike"]:
            query = query.filter(InsuranceProduct.insurance_type == "motor")
        elif c_clean in ["health", "medical"]:
            query = query.filter(InsuranceProduct.insurance_type == "health")
        elif c_clean in ["term", "life", "term life"]:
            query = query.filter(InsuranceProduct.insurance_type == "term")

    if insurer_id:
        query = query.filter(InsuranceProduct.insurer_id == insurer_id)

    if min_premium is not None:
        query = query.filter(InsuranceProduct.minimum_premium >= min_premium)
    if max_premium is not None:
        query = query.filter(InsuranceProduct.minimum_premium <= max_premium)

    if min_coverage is not None:
        query = query.filter(InsuranceProduct.default_coverage_amount >= min_coverage)

    if maternity_only:
        query = query.filter(InsuranceProduct.maternity_covered == True)
    if opd_only:
        query = query.filter(InsuranceProduct.opd_covered == True)
    if critical_illness_only:
        query = query.filter(InsuranceProduct.critical_illness_covered == True)

    # Sorting
    if sort_by == "lowest_premium":
        query = query.order_by(asc(InsuranceProduct.minimum_premium))
    elif sort_by == "highest_premium":
        query = query.order_by(desc(InsuranceProduct.minimum_premium))
    elif sort_by == "highest_coverage":
        query = query.order_by(desc(InsuranceProduct.default_coverage_amount))
    elif sort_by == "lowest_coverage":
        query = query.order_by(asc(InsuranceProduct.default_coverage_amount))
    elif sort_by == "highest_rating":
        query = query.order_by(desc(InsuranceProduct.rating))
    elif sort_by == "best_value":
        query = query.order_by(desc(InsuranceProduct.rating), asc(InsuranceProduct.minimum_premium))
    else:  # recommended
        query = query.order_by(desc(InsuranceProduct.rating), desc(InsuranceProduct.cashless_hospitals_count))

    total = query.count()
    products = query.offset(offset).limit(limit).all()

    items = []
    for p in products:
        items.append({
            "id": p.id,
            "insurer_id": p.insurer_id,
            "insurer_name": p.insurer.name if p.insurer else "Top National Insurer",
            "insurer_code": p.insurer.code if p.insurer else "insurer",
            "name": p.name,
            "category": p.insurance_type,
            "insurance_type": p.insurance_type,
            "description": p.description,
            "premium": p.minimum_premium or 999,
            "premium_frequency": p.premium_frequency or "monthly",
            "coverage_amount": p.default_coverage_amount or 500000,
            "coverage_amount_min": p.coverage_amount_min or 100000,
            "coverage_amount_max": p.coverage_amount_max or 10000000,
            "rating": p.rating or 4.8,
            "claim_settlement_ratio": p.claim_settlement_ratio or "98.4%",
            "cashless_hospitals_count": p.cashless_hospitals_count or 0,
            "waiting_period_months": p.waiting_period_months or 0,
            "maternity_covered": p.maternity_covered or False,
            "opd_covered": p.opd_covered or False,
            "critical_illness_covered": p.critical_illness_covered or False,
            "room_rent_limit": p.room_rent_limit or "No Limit",
            "plan_type": p.plan_type or "Comprehensive",
            "smoker_allowed": p.smoker_allowed or True,
            "max_entry_age": p.max_entry_age or 65,
            "features": p.features_json or ["High Claim Settlement Ratio", "24x7 Digital Claims Assistance", "Instant Paperless Issuance"],
            "exclusions": p.exclusions_json or ["Cosmetic / aesthetic treatments", "Self-inflicted injuries"],
            "riders": p.riders_json or [],
        })

    return {"total": total, "products": items}


def get_product_details(db: Session, product_id: int) -> Optional[Dict[str, Any]]:
    """Fetches full product details including add-ons, features, and pricing breakdown."""
    product = db.query(InsuranceProduct).filter(InsuranceProduct.id == product_id, InsuranceProduct.active == True).first()
    if not product:
        return None

    return {
        "id": product.id,
        "insurer_id": product.insurer_id,
        "insurer_name": product.insurer.name if product.insurer else "Top National Insurer",
        "insurer_code": product.insurer.code if product.insurer else "insurer",
        "name": product.name,
        "category": product.insurance_type,
        "insurance_type": product.insurance_type,
        "description": product.description,
        "base_rate": product.base_rate,
        "premium": product.minimum_premium or 999,
        "premium_frequency": product.premium_frequency or "monthly",
        "coverage_amount": product.default_coverage_amount or 500000,
        "coverage_amount_min": product.coverage_amount_min or 100000,
        "coverage_amount_max": product.coverage_amount_max or 10000000,
        "rating": product.rating or 4.8,
        "claim_settlement_ratio": product.claim_settlement_ratio or "98.4%",
        "cashless_hospitals_count": product.cashless_hospitals_count or 0,
        "waiting_period_months": product.waiting_period_months or 0,
        "maternity_covered": product.maternity_covered or False,
        "opd_covered": product.opd_covered or False,
        "critical_illness_covered": product.critical_illness_covered or False,
        "room_rent_limit": product.room_rent_limit or "No Limit",
        "plan_type": product.plan_type or "Comprehensive",
        "smoker_allowed": product.smoker_allowed or True,
        "max_entry_age": product.max_entry_age or 65,
        "features": product.features_json or [],
        "exclusions": product.exclusions_json or [],
        "riders": product.riders_json or [],
        "addons": [{"id": a.id, "name": a.name, "rate": a.rate, "fixed_amount": a.fixed_amount} for a in product.addons if a.active],
    }
