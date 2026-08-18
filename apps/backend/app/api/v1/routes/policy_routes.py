from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.postgres.session import get_db
from app.models.policy_model import Policy

router = APIRouter(prefix="/policies", tags=["policies"])


@router.get("/")
def list_policies(customer_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Policy)
    if customer_id:
        query = query.filter(Policy.customer_id == customer_id)
    policies = query.filter(Policy.active == True).all()
    return [
        {
            "id": p.id,
            "customer_id": p.customer_id,
            "insurance_type": p.insurance_type,
            "insurer_name": p.insurer_name,
            "product_name": p.product_name,
            "policy_number": p.policy_number,
            "status": p.status,
            "premium": p.premium,
            "idv": p.idv,
            "start_date": p.start_date,
            "end_date": p.end_date,
            "vehicle_registration": p.vehicle_registration,
        }
        for p in policies
    ]


@router.get("/{policy_id}")
def get_policy(policy_id: int, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {
        "id": policy.id,
        "customer_id": policy.customer_id,
        "insurance_type": policy.insurance_type,
        "insurer_name": policy.insurer_name,
        "product_name": policy.product_name,
        "policy_number": policy.policy_number,
        "status": policy.status,
        "premium": policy.premium,
        "idv": policy.idv,
        "coverage_amount": policy.coverage_amount,
        "deductible": policy.deductible,
        "start_date": policy.start_date,
        "end_date": policy.end_date,
        "vehicle_registration": policy.vehicle_registration,
        "vehicle_make": policy.vehicle_make,
        "vehicle_model": policy.vehicle_model,
        "ncb_percent": policy.ncb_percent,
        "addons": policy.addons,
    }
