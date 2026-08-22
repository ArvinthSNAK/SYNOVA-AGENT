"""
Policy Comparison Engine.

Normalizes quotes from multiple insurers into comparable scores across
dimensions: premium, coverage (IDV), deductible, add-ons, and benefits.
All scoring logic is configurable via weights passed in at call time.
"""
from typing import Any


DEFAULT_WEIGHTS = {
    "coverage": 0.40,
    "price": 0.25,
    "idv": 0.15,
    "addons": 0.10,
    "deductible": 0.05,
    "benefits": 0.05,
}


def _normalize_score(value: float, min_val: float, max_val: float, invert: bool = False) -> float:
    if max_val == min_val:
        return 10.0
    score = (value - min_val) / (max_val - min_val) * 10.0
    if invert:
        score = 10.0 - score
    return round(max(0.0, min(10.0, score)), 2)


def compare_quotes(quotes: list[dict[str, Any]], weights: dict[str, float] | None = None) -> list[dict[str, Any]]:
    """
    quotes: list of normalized quote dicts, each containing:
        - insurer_code, insurer_name, product_name
        - final_premium (float)
        - idv (float)
        - deductible (float, lower is better)
        - addon_count (int)
        - breakdown (list)
        - selected_addons (list[str])

    Returns sorted list with scores attached.
    """
    if not quotes:
        return []

    w = weights or DEFAULT_WEIGHTS

    premiums = [q["final_premium"] for q in quotes]
    idvs = [q.get("idv", 0) for q in quotes]
    deductibles = [q.get("deductible", 0) for q in quotes]
    addon_counts = [q.get("addon_count", 0) for q in quotes]

    min_p, max_p = min(premiums), max(premiums)
    min_idv, max_idv = min(idvs), max(idvs)
    min_ded, max_ded = min(deductibles), max(deductibles)
    min_addon, max_addon = min(addon_counts), max(addon_counts)

    results = []
    for q in quotes:
        price_score = _normalize_score(q["final_premium"], min_p, max_p, invert=True)
        idv_score = _normalize_score(q.get("idv", 0), min_idv, max_idv, invert=False)
        deductible_score = _normalize_score(q.get("deductible", 0), min_ded, max_ded, invert=True)
        addon_score = _normalize_score(q.get("addon_count", 0), min_addon, max_addon, invert=False)

        coverage_score = round((idv_score * 0.6 + addon_score * 0.4), 2)
        benefits_score = addon_score

        overall = round(
            coverage_score * w.get("coverage", 0.4)
            + price_score * w.get("price", 0.25)
            + idv_score * w.get("idv", 0.15)
            + addon_score * w.get("addons", 0.10)
            + deductible_score * w.get("deductible", 0.05)
            + benefits_score * w.get("benefits", 0.05),
            2,
        )

        results.append({
            **q,
            "scores": {
                "price": price_score,
                "coverage": coverage_score,
                "idv": idv_score,
                "deductible": deductible_score,
                "addons": addon_score,
                "benefits": benefits_score,
                "overall": overall,
            },
        })

    results.sort(key=lambda x: x["scores"]["overall"], reverse=True)

    for rank, r in enumerate(results, 1):
        r["rank"] = rank

    return results
