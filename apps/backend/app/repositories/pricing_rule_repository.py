from sqlalchemy.orm import Session
from app.models import PricingRule


class PricingRuleRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, *, product_id: int, name: str, rule_type: str | None = None, expression=None,
               priority: int = 100, active: bool = True) -> PricingRule:
        r = PricingRule(
            product_id=product_id,
            name=name,
            rule_type=rule_type,
            expression=expression,
            priority=priority,
            active=active,
        )
        self.db.add(r)
        self.db.flush()
        return r

    def list_for_product(self, product_id: int):
        return (
            self.db.query(PricingRule)
            .filter(PricingRule.product_id == product_id)
            .order_by(PricingRule.priority)
            .all()
        )
