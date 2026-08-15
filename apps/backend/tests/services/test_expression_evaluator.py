import pytest
from app.services.pricing.expression_evaluator import evaluate, ExpressionError


def test_const():
    assert evaluate({"const": 100}, {}) == 100.0


def test_var_simple():
    context = {"vehicle": {"idv": 700000}}
    assert evaluate({"var": "vehicle.idv"}, context) == 700000.0


def test_var_missing_raises():
    with pytest.raises(ExpressionError):
        evaluate({"var": "vehicle.nonexistent"}, {"vehicle": {}})


def test_factor_lookup():
    context = {"factors": {"ncb_rate": 0.2}}
    assert evaluate({"factor": "ncb_rate"}, context) == 0.2


def test_factor_missing_raises():
    with pytest.raises(ExpressionError):
        evaluate({"factor": "unknown_code"}, {"factors": {}})


def test_add():
    node = {"op": "add", "args": [{"const": 100}, {"const": 50}]}
    assert evaluate(node, {}) == 150.0


def test_mul_with_var_and_factor():
    context = {"vehicle": {"idv": 700000}, "factors": {"rate": 0.03}}
    node = {"op": "mul", "args": [{"var": "vehicle.idv"}, {"factor": "rate"}]}
    assert evaluate(node, context) == 21000.0


def test_div_by_zero_raises():
    node = {"op": "div", "args": [{"const": 10}, {"const": 0}]}
    with pytest.raises(ExpressionError):
        evaluate(node, {})


def test_min_max():
    node_min = {"op": "min", "args": [{"const": 5}, {"const": 2}, {"const": 8}]}
    node_max = {"op": "max", "args": [{"const": 5}, {"const": 2}, {"const": 8}]}
    assert evaluate(node_min, {}) == 2.0
    assert evaluate(node_max, {}) == 8.0


def test_if_condition_true_branch():
    context = {"customer": {"ncb_years": 5}}
    node = {
        "op": "if",
        "cond": {"cmp": "gte", "left": {"var": "customer.ncb_years"}, "right": {"const": 3}},
        "then": {"const": 20},
        "else": {"const": 0},
    }
    assert evaluate(node, context) == 20.0


def test_if_condition_false_branch():
    context = {"customer": {"ncb_years": 1}}
    node = {
        "op": "if",
        "cond": {"cmp": "gte", "left": {"var": "customer.ncb_years"}, "right": {"const": 3}},
        "then": {"const": 20},
        "else": {"const": 0},
    }
    assert evaluate(node, context) == 0.0


def test_unknown_op_raises():
    with pytest.raises(ExpressionError):
        evaluate({"op": "power", "args": [{"const": 2}, {"const": 3}]}, {})


def test_malformed_node_raises():
    with pytest.raises(ExpressionError):
        evaluate({"unexpected_key": 1}, {})