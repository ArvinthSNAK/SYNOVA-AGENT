from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.postgres.session import get_db
from app.services.admin_service import AdminService
from app.schemas.admin_schema import InsurerCreate, InsuranceProductCreate, PricingRuleCreate


def _to_dict(obj):
    """Convert a SQLAlchemy model instance to a plain dict, skipping internal state."""
    return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}


def create_insurer(payload: InsurerCreate, db: Session = Depends(get_db)):
    svc = AdminService(db)
    try:
        insurer = svc.create_insurer(name=payload.name, description=payload.description, active=payload.active)
        return _to_dict(insurer)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def list_insurers(db: Session = Depends(get_db)):
    svc = AdminService(db)
    insurers = svc.list_insurers()
    return [_to_dict(i) for i in insurers]


def create_product(payload: InsuranceProductCreate, db: Session = Depends(get_db)):
    svc = AdminService(db)
    try:
        product = svc.create_product(
            insurer_id=payload.insurer_id,
            name=payload.name,
            insurance_type=payload.insurance_type,
            description=payload.description,
            base_rate=payload.base_rate,
            minimum_premium=payload.minimum_premium,
            maximum_premium=payload.maximum_premium,
            active=payload.active,
        )
        return _to_dict(product)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def list_products_by_insurer(insurer_id: int, db: Session = Depends(get_db)):
    svc = AdminService(db)
    products = svc.list_products_by_insurer(insurer_id=insurer_id)
    return [_to_dict(p) for p in products]


def create_pricing_rule(payload: PricingRuleCreate, db: Session = Depends(get_db)):
    svc = AdminService(db)
    try:
        r = svc.create_pricing_rule(
            product_id=payload.product_id,
            name=payload.name,
            rule_type=payload.rule_type,
            expression=payload.expression,
            priority=payload.priority,
            active=payload.active,
        )
        return _to_dict(r)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))