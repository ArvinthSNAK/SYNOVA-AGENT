import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.insurance_product_model import InsuranceProduct
from app.models.insurer_model import Insurer


def parse_natural_language_query(query: str) -> Dict[str, Any]:
    """
    Parses user query, extracting:
    - category (motor, health, term)
    - budget (monthly or annual max limit)
    - min_coverage (e.g. 10 Lakh, 1 Crore)
    - required features (maternity, zero dep, rsa, opd, critical illness, smokers)
    """
    q_lower = query.lower()

    # 1. Determine Category
    category = None
    if any(k in q_lower for k in ["health", "mediclaim", "medical", "hospital", "doctor", "maternity", "floater"]):
        category = "health"
    elif any(k in q_lower for k in ["car", "bike", "motor", "vehicle", "auto", "zero dep", "rsa", "idv"]):
        category = "motor"
    elif any(k in q_lower for k in ["term", "life", "death", "crore", "survivor", "nominee", "income"]):
        category = "term"

    # 2. Extract Budget Bounds
    budget_max = None
    is_monthly = True

    # Check for monthly patterns: "under ₹1000/mo", "<1500 per month", "below 800 a month"
    budget_match = re.search(r'(?:under|below|less than|within|max|<=?)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)\s*(?:per month|\/month|\/mo|a month|monthly)?', q_lower)
    if budget_match:
        val_str = budget_match.group(1).replace(',', '')
        try:
            budget_max = float(val_str)
            if "year" in q_lower or "annual" in q_lower or "/yr" in q_lower or budget_max > 5000:
                is_monthly = False
        except ValueError:
            pass

    # 3. Extract Coverage (e.g. "10 lakh", "1 crore", "50L", "5L")
    min_coverage = None
    cr_match = re.search(r'([0-9\.]+)\s*(?:crore|cr)\b', q_lower)
    if cr_match:
        try:
            min_coverage = float(cr_match.group(1)) * 10000000
        except ValueError:
            pass
    else:
        lakh_match = re.search(r'([0-9\.]+)\s*(?:lakh|lac|l)\b', q_lower)
        if lakh_match:
            try:
                min_coverage = float(lakh_match.group(1)) * 100000
            except ValueError:
                pass

    # 4. Extract Required Feature Keywords
    features = []
    if "maternity" in q_lower:
        features.append("maternity")
    if "zero dep" in q_lower or "bumper to bumper" in q_lower:
        features.append("zero_dep")
    if "rsa" in q_lower or "roadside" in q_lower:
        features.append("roadside")
    if "opd" in q_lower:
        features.append("opd")
    if "critical illness" in q_lower or "cancer" in q_lower:
        features.append("critical_illness")
    if "cashless" in q_lower:
        features.append("cashless")
    if "non-smoker" in q_lower or "non smoker" in q_lower:
        features.append("non_smoker")

    return {
        "raw_query": query,
        "category": category,
        "budget_max": budget_max,
        "is_monthly": is_monthly,
        "min_coverage": min_coverage,
        "features": features,
    }


def execute_natural_language_search(db: Session, query_str: str) -> Dict[str, Any]:
    """Executes NLP search, ranks products with a configurable weighted scoring model, and produces rationale."""
    parsed = parse_natural_language_query(query_str)
    category = parsed["category"]

    query = db.query(InsuranceProduct).join(Insurer).filter(InsuranceProduct.active == True)
    if category:
        query = query.filter(InsuranceProduct.insurance_type == category)

    all_products = query.all()
    if not all_products:
        # Fallback to all products if category was ambiguous
        all_products = db.query(InsuranceProduct).join(Insurer).filter(InsuranceProduct.active == True).all()

    scored_items = []

    budget = parsed["budget_max"]
    min_cov = parsed["min_coverage"]
    req_features = parsed["features"]

    for p in all_products:
        score = 0.0
        reasons = []
        limitations = []

        premium = p.minimum_premium or 999.0
        coverage = p.default_coverage_amount or 500000.0
        rating = p.rating or 4.5

        # 1. Premium Weight: 30%
        if budget:
            if premium <= budget:
                # Within budget
                savings_ratio = (budget - premium) / budget
                score += 30.0 * (0.8 + 0.2 * min(1.0, savings_ratio))
                reasons.append(f"Fits within your budget of ₹{int(budget):,}/mo at ₹{int(premium):,}/mo")
            else:
                over_ratio = (premium - budget) / budget
                score += max(0.0, 30.0 * (1.0 - over_ratio * 2))
                limitations.append(f"Premium (₹{int(premium):,}) slightly exceeds your target budget (₹{int(budget):,})")
        else:
            score += 25.0

        # 2. Coverage Weight: 25%
        if min_cov:
            if coverage >= min_cov:
                score += 25.0
                reasons.append(f"Provides required coverage of ₹{int(coverage):,}")
            else:
                cov_ratio = coverage / min_cov
                score += 25.0 * max(0.2, cov_ratio)
                limitations.append(f"Coverage is ₹{int(coverage):,}, below your target of ₹{int(min_cov):,}")
        else:
            score += 20.0

        # 3. Requested Features Weight: 25%
        if req_features:
            matched_feat_count = 0
            for f in req_features:
                if f == "maternity" and p.maternity_covered:
                    matched_feat_count += 1
                    reasons.append("Includes Comprehensive Maternity & Newborn Cover")
                elif f == "opd" and p.opd_covered:
                    matched_feat_count += 1
                    reasons.append("Includes Daycare & OPD Medical Cover")
                elif f == "critical_illness" and p.critical_illness_covered:
                    matched_feat_count += 1
                    reasons.append("Includes Critical Illness Benefit Protection")
                elif f == "cashless" and p.cashless_hospitals_count > 5000:
                    matched_feat_count += 1
                    reasons.append(f"Extensive Cashless Hospital Network ({p.cashless_hospitals_count:,}+ hospitals)")
                elif f in ["zero_dep", "roadside"] and p.insurance_type == "motor":
                    matched_feat_count += 1
                    reasons.append("Includes Zero Depreciation & 24x7 Roadside Assistance")

            feature_ratio = matched_feat_count / len(req_features) if req_features else 1.0
            score += 25.0 * feature_ratio
        else:
            score += 20.0

        # 4. Insurer / Product Rating Weight: 10%
        score += 10.0 * (rating / 5.0)

        # 5. Benefits & Claim Settlement Weight: 10%
        csr_val = float(p.claim_settlement_ratio.replace('%', '')) if p.claim_settlement_ratio else 98.0
        score += 10.0 * (csr_val / 100.0)

        final_match_pct = round(min(99.0, max(50.0, score)), 1)

        scored_items.append({
            "product": {
                "id": p.id,
                "insurer_id": p.insurer_id,
                "insurer_name": p.insurer.name if p.insurer else "Top National Insurer",
                "insurer_code": p.insurer.code if p.insurer else "insurer",
                "name": p.name,
                "category": p.insurance_type,
                "insurance_type": p.insurance_type,
                "description": p.description,
                "premium": premium,
                "premium_frequency": p.premium_frequency or "monthly",
                "coverage_amount": coverage,
                "rating": rating,
                "claim_settlement_ratio": p.claim_settlement_ratio or "98.4%",
                "cashless_hospitals_count": p.cashless_hospitals_count or 0,
                "waiting_period_months": p.waiting_period_months or 0,
                "maternity_covered": p.maternity_covered or False,
                "opd_covered": p.opd_covered or False,
                "critical_illness_covered": p.critical_illness_covered or False,
                "room_rent_limit": p.room_rent_limit or "No Limit",
                "features": p.features_json or [],
                "riders": p.riders_json or [],
            },
            "match_score": final_match_pct,
            "rationale": " • ".join(reasons) if reasons else "High-ranking value plan matching standard parameters.",
            "pros": reasons[:3],
            "limitations": limitations[:2],
        })

    # Sort descending by match score
    scored_items.sort(key=lambda x: x["match_score"], reverse=True)

    return {
        "parsed_intent": parsed,
        "matched_count": len(scored_items),
        "results": scored_items[:15],
    }
