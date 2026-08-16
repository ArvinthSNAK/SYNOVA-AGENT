from sqlalchemy.orm import Session
from app.repositories.insurer_repository import InsurerRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.pricing_rule_repository import PricingRuleRepository


class AdminService:
    def __init__(self, db: Session):
        self.db = db
        self.insurers = InsurerRepository(db)
        self.products = ProductRepository(db)
        self.pricing_rules = PricingRuleRepository(db)

    def create_insurer(self, name: str, description: str | None = None, active: bool = True):
        insurer = self.insurers.create(name=name, description=description, active=active)
        self.db.commit()
        self.db.refresh(insurer)
        return insurer

    def list_insurers(self, limit: int = 100, offset: int = 0):
        return self.insurers.list(limit=limit, offset=offset)

    def create_product(self, **kwargs):
        p = self.products.create(**kwargs)
        self.db.commit()
        self.db.refresh(p)
        return p

    def list_products_by_insurer(self, insurer_id: int, limit: int = 100, offset: int = 0):
        return self.products.list_by_insurer(insurer_id=insurer_id, limit=limit, offset=offset)

    def create_pricing_rule(self, **kwargs):
        r = self.pricing_rules.create(**kwargs)
        self.db.commit()
        self.db.refresh(r)
        return r
