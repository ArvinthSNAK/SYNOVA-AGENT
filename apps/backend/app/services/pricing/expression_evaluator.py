"""
Safe JSON-expression evaluator for pricing rules.
NEVER use eval()/exec() here — this module is the whole point of avoiding that.
"""
from typing import Any, Dict


class ExpressionError(ValueError):
    """Raised when an expression is malformed or references unknown data."""


def _get_var(path: str, context: Dict[str, Any]) -> float:
    """Resolve a dotted path like 'vehicle.idv' against the context dict."""
    parts = path.split(".")
    node = context
    for part in parts:
        if isinstance(node, dict) and part in node:
            node = node[part]
        else:
            raise ExpressionError(f"Unknown variable path: '{path}'")
    if not isinstance(node, (int, float)):
        raise ExpressionError(f"Variable '{path}' did not resolve to a number")
    return float(node)


def _get_factor(code: str, context: Dict[str, Any]) -> float:
    factors = context.get("factors", {})
    if code not in factors:
        raise ExpressionError(f"Unknown pricing factor code: '{code}'")
    return float(factors[code])


_ARITHMETIC = {
    "add": lambda vals: sum(vals),
    "sub": lambda vals: vals[0] - sum(vals[1:]),
    "mul": lambda vals: _reduce_mul(vals),
    "div": lambda vals: _reduce_div(vals),
    "min": lambda vals: min(vals),
    "max": lambda vals: max(vals),
}

_COMPARISONS = {
    "gt": lambda a, b: a > b,
    "gte": lambda a, b: a >= b,
    "lt": lambda a, b: a < b,
    "lte": lambda a, b: a <= b,
    "eq": lambda a, b: a == b,
}


def _reduce_mul(vals):
    result = 1.0
    for v in vals:
        result *= v
    return result


def _reduce_div(vals):
    result = vals[0]
    for v in vals[1:]:
        if v == 0:
            raise ExpressionError("Division by zero in pricing expression")
        result /= v
    return result


def evaluate(node: Any, context: Dict[str, Any]) -> float:
    """
    Recursively evaluate a pricing expression node against a context dict.

    context shape:
        {
            "vehicle": {"idv": 700000, "age_years": 3, ...},
            "customer": {"ncb_percent": 20, ...},
            "factors": {"ncb_discount_rate": 0.20, ...},
        }
    """
    if not isinstance(node, dict):
        raise ExpressionError(f"Expression node must be an object, got: {node!r}")

    if "const" in node:
        val = node["const"]
        if not isinstance(val, (int, float)):
            raise ExpressionError("'const' must be a number")
        return float(val)

    if "var" in node:
        return _get_var(node["var"], context)

    if "factor" in node:
        return _get_factor(node["factor"], context)

    if "op" in node:
        op = node["op"]

        if op == "if":
            cond = _evaluate_condition(node["cond"], context)
            branch = node["then"] if cond else node["else"]
            return evaluate(branch, context)

        if op not in _ARITHMETIC:
            raise ExpressionError(f"Unknown operator: '{op}'")

        args = node.get("args")
        if not isinstance(args, list) or not args:
            raise ExpressionError(f"Operator '{op}' requires a non-empty 'args' list")

        values = [evaluate(arg, context) for arg in args]
        return _ARITHMETIC[op](values)

    raise ExpressionError(f"Unrecognized expression node: {node!r}")


def _evaluate_condition(node: Dict[str, Any], context: Dict[str, Any]) -> bool:
    if "cmp" not in node:
        raise ExpressionError("Condition node must contain 'cmp'")
    cmp = node["cmp"]
    if cmp not in _COMPARISONS:
        raise ExpressionError(f"Unknown comparison: '{cmp}'")
    left = evaluate(node["left"], context)
    right = evaluate(node["right"], context)
    return _COMPARISONS[cmp](left, right)