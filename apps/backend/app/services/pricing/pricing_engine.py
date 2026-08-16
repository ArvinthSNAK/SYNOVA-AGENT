"""
Pricing engine: loads active pricing_rules + pricing_factors for a product
and computes a final premium plus a per-rule breakdown (for transparency
in the recommendation/comparison engine later).
"""
from typing import Any, Dict, List
from sqlalchemy.orm import Session

from app.models.pricing_rule_model import PricingRule
from app.models.pricing_factor_model import PricingFactor
from app.services.pricing.expression_evaluator import evaluate, ExpressionError


class PricingEngineError(ValueError):
    pass


_COMBINATORS = {
    "base": lambda total, val: val,
    "loading": lambda total, val: total + val,
    "addon": lambda total, val: total + val,
    "discount": lambda total, val: total - val,
    "tax": lambda total, val: total + (total * val / 100.0),
    "multiplier": lambda total, val: total * val,
}


def load_factors(db: Session) -> Dict[str, float]:
    factors = db.query(PricingFactor).filter(PricingFactor.active.is_(True)).all()
    return {f.code: f.value for f in factors if f.value is not None}


def load_rules(db: Session, product_id: int) -> List[PricingRule]:
    return (
        db.query(PricingRule)
        .filter(PricingRule.product_id == product_id, PricingRule.active.is_(True))
        .order_by(PricingRule.priority.asc())
        .all()
    )


def calculate_premium(
    db: Session, product_id: int, input_context: Dict[str, Any]
) -> Dict[str, Any]:
    """
    input_context: caller-supplied data, e.g.
        {"vehicle": {...}, "customer": {...}, "driver": {...}}

    Returns:
        {
            "final_premium": 22450.0,
            "breakdown": [
                {"rule": "Base OD Premium", "rule_type": "base", "value": 18000.0, "running_total": 18000.0},
                {"rule": "NCB Discount", "rule_type": "discount", "value": 3600.0, "running_total": 14400.0},
                {"rule": "GST", "rule_type": "tax", "value": 18.0, "running_total": 16992.0},
                ...
            ]
        }
    """
    rules = load_rules(db, product_id)
    if not rules:
        raise PricingEngineError(f"No active pricing rules found for product_id={product_id}")

    factors = load_factors(db)
    context = dict(input_context)
    context["factors"] = factors

    total = 0.0
    breakdown = []

    for rule in rules:
        if rule.expression is None:
            raise PricingEngineError(f"Rule '{rule.name}' (id={rule.id}) has no expression")

        try:
            value = evaluate(rule.expression, context)
        except ExpressionError as e:
            raise PricingEngineError(
                f"Error evaluating rule '{rule.name}' (id={rule.id}): {e}"
            ) from e

        rule_type = rule.rule_type or "loading"
        combinator = _COMBINATORS.get(rule_type, _COMBINATORS["loading"])
        total = combinator(total, value)

        breakdown.append(
            {
                "rule": rule.name,
                "rule_type": rule_type,
                "value": round(value, 2),
                "running_total": round(total, 2),
            }
        )

    return {"final_premium": round(total, 2), "breakdown": breakdown}