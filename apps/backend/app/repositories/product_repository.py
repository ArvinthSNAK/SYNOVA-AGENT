from sqlalchemy.orm import Session
from app.models import InsuranceProduct


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, *, insurer_id: int, name: str, insurance_type: str, description: str | None = None,
               base_rate: float | None = None, minimum_premium: float | None = None,
               maximum_premium: float | None = None, active: bool = True) -> InsuranceProduct:
        p = InsuranceProduct(
            insurer_id=insurer_id,
            name=name,
            insurance_type=insurance_type,
            description=description,
            base_rate=base_rate,
            minimum_premium=minimum_premium,
            maximum_premium=maximum_premium,
            active=active,
        )
        self.db.add(p)
        self.db.flush()
        return p

    def get(self, product_id: int):
        return self.db.query(InsuranceProduct).filter(InsuranceProduct.id == product_id).one_or_none()

    def list_by_insurer(self, insurer_id: int, limit: int = 100, offset: int = 0):
        return (
            self.db.query(InsuranceProduct)
            .filter(InsuranceProduct.insurer_id == insurer_id)
            .order_by(InsuranceProduct.id)
            .limit(limit)
            .offset(offset)
            .all()
        )
