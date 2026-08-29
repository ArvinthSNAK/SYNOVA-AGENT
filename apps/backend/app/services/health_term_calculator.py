from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.insurance_product_model import InsuranceProduct
from app.services.pricing.pricing_engine import calculate_premium


def calculate_health_quote(
    db: Session,
    product_id: int,
    proposer_age: int,
    member_count: int = 1,
    sum_insured: float = 500000.0,
    has_pre_existing_disease: bool = False,
    city_tier: int = 1,  # 1 for Metro, 2 for Tier-2
    selected_addon_ids: List[int] = None,
) -> Dict[str, Any]:
    """Calculates dynamic health insurance premium using database pricing rules."""
    product = db.query(InsuranceProduct).filter(InsuranceProduct.id == product_id).first()
    if not product:
        raise ValueError(f"Product {product_id} not found")

    # Base rate derived from sum insured and member count
    base_factor = sum_insured / 500000.0
    age_factor = 1.0 + max(0, (proposer_age - 25) * 0.025)
    floater_factor = 1.0 + max(0, (member_count - 1) * 0.45)
    ped_factor = 1.25 if has_pre_existing_disease else 1.0
    city_factor = 1.15 if city_tier == 1 else 1.0

    monthly_base = (product.minimum_premium or 650.0) * base_factor * age_factor * floater_factor * ped_factor * city_factor
    annual_base = monthly_base * 11.2  # 1-month annual discount

    # Calculate add-ons
    addon_total = 0.0
    selected_addons_breakdown = []
    if selected_addon_ids:
        for addon in product.addons:
            if addon.id in selected_addon_ids and addon.active:
                cost = (addon.fixed_amount or (annual_base * (addon.rate or 0.05)))
                addon_total += cost
                selected_addons_breakdown.append({"id": addon.id, "name": addon.name, "amount": round(cost, 2)})

    final_annual = round(annual_base + addon_total, 2)
    final_monthly = round(final_annual / 12.0, 2)

    return {
        "product_id": product.id,
        "product_name": product.name,
        "insurer_name": product.insurer.name if product.insurer else "Insurer",
        "sum_insured": sum_insured,
        "monthly_premium": final_monthly,
        "annual_premium": final_annual,
        "breakdown": {
            "base_medical_premium": round(annual_base, 2),
            "age_loading": round((age_factor - 1.0) * 100, 1),
            "floater_discount_loading": round((floater_factor - 1.0) * 100, 1),
            "pre_existing_loading": round((ped_factor - 1.0) * 100, 1),
            "addons_total": round(addon_total, 2),
            "addons": selected_addons_breakdown,
            "gst_18_pct": round(final_annual * 0.18, 2),
        },
    }


def calculate_term_quote(
    db: Session,
    product_id: int,
    age: int,
    gender: str = "male",
    is_smoker: bool = False,
    annual_income: float = 1000000.0,
    sum_assured: float = 10000000.0,  # 1 Crore default
    policy_term_years: int = 30,
    selected_riders: List[str] = None,
) -> Dict[str, Any]:
    """Calculates dynamic term life insurance premium using database pricing rules."""
    product = db.query(InsuranceProduct).filter(InsuranceProduct.id == product_id).first()
    if not product:
        raise ValueError(f"Product {product_id} not found")

    # Base per crore
    crore_factor = sum_assured / 10000000.0
    age_multiplier = 1.0 + max(0, (age - 21) * 0.04)
    smoker_multiplier = 1.55 if is_smoker else 1.0
    gender_multiplier = 0.90 if gender.lower() == "female" else 1.0
    term_multiplier = 1.0 + (policy_term_years - 20) * 0.01

    base_annual = (product.minimum_premium or 450.0) * 12.0 * crore_factor * age_multiplier * smoker_multiplier * gender_multiplier * term_multiplier

    # Riders
    rider_total = 0.0
    rider_breakdown = []
    if selected_riders:
        for r in selected_riders:
            r_lower = r.lower()
            if "accidental" in r_lower:
                r_cost = 950.0 * crore_factor
                rider_total += r_cost
                rider_breakdown.append({"rider": "Accidental Death Benefit (₹1 Cr)", "premium": r_cost})
            elif "critical" in r_lower:
                r_cost = 2400.0 * (sum_assured / 2500000.0)
                rider_total += r_cost
                rider_breakdown.append({"rider": "Critical Illness Benefit (₹25 Lakh)", "premium": r_cost})
            elif "waiver" in r_lower:
                r_cost = base_annual * 0.06
                rider_total += r_cost
                rider_breakdown.append({"rider": "Waiver of Premium on Disability", "premium": round(r_cost, 2)})

    final_annual = round(base_annual + rider_total, 2)
    final_monthly = round(final_annual / 12.0, 2)

    return {
        "product_id": product.id,
        "product_name": product.name,
        "insurer_name": product.insurer.name if product.insurer else "Insurer",
        "sum_assured": sum_assured,
        "policy_term_years": policy_term_years,
        "monthly_premium": final_monthly,
        "annual_premium": final_annual,
        "breakdown": {
            "base_mortality_premium": round(base_annual, 2),
            "smoker_status": "Smoker (Loaded)" if is_smoker else "Non-Smoker Preferred Rate",
            "female_discount": gender.lower() == "female",
            "riders_total": round(rider_total, 2),
            "riders": rider_breakdown,
            "tax_saved_under_80c": round(min(150000.0, final_annual) * 0.30, 2),
        },
    }
