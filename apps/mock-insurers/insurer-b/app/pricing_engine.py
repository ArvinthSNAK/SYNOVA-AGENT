from sqlalchemy.orm import Session
from app.models import Product, PricingRule, AddOn


class PricingEngineError(ValueError):
    pass


def _evaluate_expression(expr: dict, context: dict) -> float:
    if "const" in expr:
        return float(expr["const"])

    if "var" in expr:
        var_name = expr["var"]
        if var_name not in context:
            raise PricingEngineError(f"Unknown variable in expression: {var_name}")
        return float(context[var_name])

    if "op" in expr:
        op = expr["op"]
        args = [_evaluate_expression(a, context) for a in expr.get("args", [])]

        if op == "add":
            return sum(args)
        if op == "sub":
            if len(args) != 2:
                raise PricingEngineError("sub requires exactly 2 args")
            return args[0] - args[1]
        if op == "mul":
            result = 1.0
            for a in args:
                result *= a
            return result
        if op == "div":
            if len(args) != 2:
                raise PricingEngineError("div requires exactly 2 args")
            if args[1] == 0:
                raise PricingEngineError("division by zero in pricing expression")
            return args[0] / args[1]

        raise PricingEngineError(f"Unsupported operator: {op}")

    raise PricingEngineError(f"Unrecognized expression shape: {expr}")


def calculate_quote(db: Session, product_id: int, context: dict, selected_addon_ids: list[int]) -> dict:
    product = db.query(Product).filter(Product.id == product_id, Product.active == True).first()
    if product is None:
        raise PricingEngineError(f"Product with id={product_id} not found or inactive")

    rules = (
        db.query(PricingRule)
        .filter(PricingRule.product_id == product_id, PricingRule.active == True)
        .order_by(PricingRule.priority.asc())
        .all()
    )
    if not rules:
        raise PricingEngineError(f"No active pricing rules configured for product {product_id}")

    running_total = 0.0
    breakdown = []

    for rule in rules:
        value = _evaluate_expression(rule.expression, context)

        if rule.rule_type in ("base", "loading", "tax"):
            running_total += value
        elif rule.rule_type == "discount":
            running_total -= value
        else:
            raise PricingEngineError(f"Unknown rule_type: {rule.rule_type}")

        breakdown.append({
            "rule": rule.name,
            "rule_type": rule.rule_type,
            "value": round(value, 2),
            "running_total": round(running_total, 2),
        })

    addon_total = 0.0
    selected_addons = []
    if selected_addon_ids:
        addons = (
            db.query(AddOn)
            .filter(AddOn.product_id == product_id, AddOn.id.in_(selected_addon_ids), AddOn.active == True)
            .all()
        )
        for addon in addons:
            addon_total += addon.premium_flat_amount
            selected_addons.append(addon.name)
            breakdown.append({
                "rule": f"Add-on: {addon.name}",
                "rule_type": "addon",
                "value": round(addon.premium_flat_amount, 2),
                "running_total": round(running_total + addon_total, 2),
            })

    final_premium = round(running_total + addon_total, 2)

    return {
        "product_name": product.name,
        "final_premium": final_premium,
        "breakdown": breakdown,
        "selected_addons": selected_addons,
    }