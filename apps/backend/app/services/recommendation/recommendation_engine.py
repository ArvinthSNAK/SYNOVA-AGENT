"""
Recommendation Engine.

Takes the ranked comparison output and generates a human-readable
recommendation explaining why the top policy is recommended,
what it covers, what it excludes, coverage gaps, and why others ranked lower.
"""
from typing import Any


def generate_recommendation(ranked_quotes: list[dict[str, Any]]) -> dict[str, Any]:
    if not ranked_quotes:
        return {"error": "No quotes available for recommendation"}

    best = ranked_quotes[0]
    others = ranked_quotes[1:]

    strengths = _identify_strengths(best, others)
    tradeoffs = _identify_tradeoffs(best, others)
    coverage_gaps = _identify_coverage_gaps(best)
    others_reasoning = _explain_others(best, others)

    return {
        "recommended_policy": {
            "insurer_code": best["insurer_code"],
            "insurer_name": best["insurer_name"],
            "product_name": best["product_name"],
            "final_premium": best["final_premium"],
            "overall_score": best["scores"]["overall"],
        },
        "why_recommended": strengths,
        "tradeoffs": tradeoffs,
        "coverage_gaps": coverage_gaps,
        "other_policies": others_reasoning,
        "disclaimer": "This recommendation is based on configured scoring criteria and may not reflect individual preferences.",
    }


def _identify_strengths(best: dict, others: list[dict]) -> list[str]:
    strengths = []
    scores = best["scores"]

    if not others:
        strengths.append("Only available quote")
        return strengths

    avg_price = sum(o["scores"]["price"] for o in others) / len(others)
    avg_coverage = sum(o["scores"]["coverage"] for o in others) / len(others)
    avg_idv = sum(o["scores"]["idv"] for o in others) / len(others)

    if scores["coverage"] > avg_coverage:
        strengths.append("Higher overall coverage compared to alternatives")
    if scores["price"] > avg_price:
        strengths.append("More competitive premium pricing")
    if scores["idv"] > avg_idv:
        strengths.append("Higher Insured Declared Value (IDV)")
    if scores["addons"] >= 8.0:
        strengths.append("Comprehensive add-on coverage available")
    if scores["deductible"] >= 8.0:
        strengths.append("Lower deductible (less out-of-pocket expense)")
    if scores["overall"] >= 8.0:
        strengths.append("Highest overall score across all evaluation criteria")

    if not strengths:
        strengths.append("Best balanced option across price, coverage, and benefits")

    return strengths


def _identify_tradeoffs(best: dict, others: list[dict]) -> list[str]:
    tradeoffs = []

    for other in others:
        if other["scores"]["price"] > best["scores"]["price"]:
            diff = other["final_premium"] - best["final_premium"]
            if diff < 0:
                tradeoffs.append(
                    f"{other['insurer_name']} is ₹{abs(diff):.0f} cheaper but scored lower overall"
                )

        if other["scores"]["idv"] > best["scores"]["idv"]:
            tradeoffs.append(
                f"{other['insurer_name']} offers higher IDV but at a higher premium"
            )

    return tradeoffs[:3]


def _identify_coverage_gaps(best: dict) -> list[str]:
    gaps = []
    common_addons = [
        "Zero Depreciation",
        "Engine Protection",
        "Roadside Assistance",
        "Return to Invoice",
        "Consumables Cover",
        "Key Replacement",
        "Tyre Protection",
        "Personal Accident Cover",
    ]

    selected = set(best.get("selected_addons", []))
    for addon in common_addons:
        if addon not in selected:
            gaps.append(f"{addon} not included in this quote")

    return gaps[:5]


def _explain_others(best: dict, others: list[dict]) -> list[dict[str, Any]]:
    explanations = []
    for other in others:
        reasons = []
        if other["scores"]["overall"] < best["scores"]["overall"]:
            if other["scores"]["coverage"] < best["scores"]["coverage"]:
                reasons.append("Lower coverage score")
            if other["scores"]["price"] < best["scores"]["price"]:
                reasons.append("Higher premium")
            if other["scores"]["addons"] < best["scores"]["addons"]:
                reasons.append("Fewer add-on options")
            if other["scores"]["deductible"] < best["scores"]["deductible"]:
                reasons.append("Higher deductible")

        if not reasons:
            reasons.append("Lower overall weighted score")

        explanations.append({
            "insurer_code": other["insurer_code"],
            "insurer_name": other["insurer_name"],
            "product_name": other["product_name"],
            "final_premium": other["final_premium"],
            "overall_score": other["scores"]["overall"],
            "rank": other["rank"],
            "why_lower": reasons,
        })

    return explanations
