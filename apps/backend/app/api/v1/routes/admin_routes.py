from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session

from app.db.postgres.session import get_db
from app.controllers import admin_controller
from app.schemas.admin_schema import InsurerCreate, InsuranceProductCreate, PricingRuleCreate

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/insurers", response_model=dict)
def create_insurer(payload: InsurerCreate, db: Session = Depends(get_db)):
    return admin_controller.create_insurer(payload, db)


@router.get("/insurers", response_model=List[dict])
def get_insurers(db: Session = Depends(get_db)):
    return admin_controller.list_insurers(db)


@router.post("/products", response_model=dict)
def create_product(payload: InsuranceProductCreate, db: Session = Depends(get_db)):
    return admin_controller.create_product(payload, db)


@router.get("/products/{insurer_id}", response_model=List[dict])
def get_products(insurer_id: int, db: Session = Depends(get_db)):
    return admin_controller.list_products_by_insurer(insurer_id, db)


@router.post("/pricing-rules", response_model=dict)
def create_pricing_rule(payload: PricingRuleCreate, db: Session = Depends(get_db)):
    return admin_controller.create_pricing_rule(payload, db)