from types import SimpleNamespace
from unittest.mock import MagicMock
import pytest

from app.services.pricing.pricing_engine import calculate_premium, PricingEngineError


def make_rule(id, name, rule_type, expression, priority, active=True):
    return SimpleNamespace(
        id=id, name=name, rule_type=rule_type, expression=expression,
        priority=priority, active=active,
    )


def make_factor(code, value, active=True):
    return SimpleNamespace(code=code, value=value, active=active)


def _mock_db(rules, factors):
    db = MagicMock()

    def query_side_effect(model):
        q = MagicMock()
        if model.__name__ == "PricingRule":
            q.filter.return_value.order_by.return_value.all.return_value = rules
        elif model.__name__ == "PricingFactor":
            q.filter.return_value.all.return_value = factors
        return q

    db.query.side_effect = query_side_effect
    return db


def test_calculate_premium_base_discount_tax():
    rules = [
        make_rule(1, "Base OD Premium", "base", {"const": 18000}, priority=10),
        make_rule(
            2, "NCB Discount", "discount",
            {"op": "mul", "args": [{"const": 18000}, {"factor": "ncb_rate"}]},
            priority=20,
        ),
        make_rule(
            3, "GST", "tax", {"const": 18}, priority=90
        ),
    ]
    factors = [make_factor("ncb_rate", 0.20)]
    db = _mock_db(rules, factors)

    result = calculate_premium(db, product_id=1, input_context={"vehicle": {"idv": 700000}})

    # 18000 base -> -3600 (20% NCB) = 14400 -> +18% GST = 16992
    assert result["final_premium"] == 16992.0
    assert len(result["breakdown"]) == 3
    assert result["breakdown"][0]["rule_type"] == "base"
    assert result["breakdown"][-1]["rule_type"] == "tax"


def test_no_active_rules_raises():
    db = _mock_db([], [])
    with pytest.raises(PricingEngineError):
        calculate_premium(db, product_id=99, input_context={})


def test_bad_expression_raises_with_context():
    rules = [make_rule(1, "Broken Rule", "base", {"var": "vehicle.missing_field"}, priority=10)]
    db = _mock_db(rules, [])
    with pytest.raises(PricingEngineError) as exc_info:
        calculate_premium(db, product_id=1, input_context={"vehicle": {}})
    assert "Broken Rule" in str(exc_info.value)