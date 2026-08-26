from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.db.postgres.session import get_db
from app.models.policy_model import Policy
from app.models.policy_version_model import PolicyVersion

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
            "coverage_amount": p.coverage_amount,
            "deductible": p.deductible,
            "start_date": p.start_date,
            "end_date": p.end_date,
            "vehicle_registration": p.vehicle_registration,
            "vehicle_make": p.vehicle_make,
            "vehicle_model": p.vehicle_model,
            "ncb_percent": p.ncb_percent,
            "addons": p.addons,
            "notes": p.notes,
        }
        for p in policies
    ]


@router.get("/vault/{customer_id}")
def get_customer_vault(customer_id: int, db: Session = Depends(get_db)):
    policies = (
        db.query(Policy)
        .filter(Policy.customer_id == customer_id, Policy.active == True)
        .all()
    )

    now = datetime.now()
    expiring_soon_threshold = now + timedelta(days=30)

    categories = {"motor": [], "health": [], "term": [], "other": []}
    stats = {
        "total_policies": len(policies),
        "active_policies": 0,
        "expiring_soon": 0,
        "total_annual_premium": 0.0,
    }

    for p in policies:
        is_active = p.status == "active"
        is_expiring = p.end_date and (now <= p.end_date <= expiring_soon_threshold)

        if is_active:
            stats["active_policies"] += 1
            if p.premium:
                stats["total_annual_premium"] += p.premium
        if is_expiring:
            stats["expiring_soon"] += 1

        policy_dict = {
            "id": p.id,
            "policy_number": p.policy_number,
            "insurance_type": p.insurance_type,
            "insurer_name": p.insurer_name,
            "product_name": p.product_name,
            "status": p.status,
            "premium": p.premium,
            "idv": p.idv,
            "coverage_amount": p.coverage_amount,
            "deductible": p.deductible,
            "start_date": p.start_date,
            "end_date": p.end_date,
            "vehicle_registration": p.vehicle_registration,
            "vehicle_make": p.vehicle_make,
            "vehicle_model": p.vehicle_model,
            "ncb_percent": p.ncb_percent,
            "addons": p.addons,
            "notes": p.notes,
            "is_expiring_soon": is_expiring,
        }

        c_type = (p.insurance_type or "other").lower()
        if c_type in categories:
            categories[c_type].append(policy_dict)
        else:
            categories["other"].append(policy_dict)

    return {
        "customer_id": customer_id,
        "stats": stats,
        "vault": categories,
    }


@router.get("/{policy_id}")
def get_policy(policy_id: int, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    versions = (
        db.query(PolicyVersion)
        .filter(PolicyVersion.policy_id == policy_id)
        .order_by(PolicyVersion.version.desc())
        .all()
    )

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
        "history": [
            {
                "version": v.version,
                "data": v.data,
                "effective_from": v.effective_from,
                "effective_to": v.effective_to,
            }
            for v in versions
        ],
    }


@router.post("/")
def create_policy(payload: dict, db: Session = Depends(get_db)):
    import uuid
    customer_id = payload.get("customer_id", 1)
    premium = float(payload.get("premium", payload.get("premium_amount", 5000.0)))
    insurer_name = payload.get("insurer_name", "SecureRide General")
    product_name = payload.get("product_name", "Comprehensive Motor Cover")
    reg_no = payload.get("vehicle_registration", "KA-01-MJ-4092")
    
    policy_no = f"POL-{insurer_name[:3].upper()}-{str(uuid.uuid4())[:8].upper()}"
    now = datetime.utcnow()
    end_date = now + timedelta(days=365)

    policy = Policy(
        customer_id=customer_id,
        policy_number=policy_no,
        insurance_type=payload.get("insurance_type", "motor"),
        insurer_name=insurer_name,
        product_name=product_name,
        premium=premium,
        premium_amount=premium,
        idv=float(payload.get("idv", 650000)),
        coverage_amount=float(payload.get("idv", 650000)),
        deductible=float(payload.get("deductible", 2000.0)),
        start_date=now,
        end_date=end_date,
        vehicle_registration=reg_no,
        vehicle_make=payload.get("vehicle_make", "Hyundai"),
        vehicle_model=payload.get("vehicle_model", "Creta"),
        ncb_percent=float(payload.get("ncb_percent", 20.0)),
        addons=payload.get("addons", ["Zero Depreciation", "Roadside Assistance"]),
        active=True,
        status="active",
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)

    return {
        "status": "SUCCESS",
        "message": f"Policy {policy.policy_number} issued successfully!",
        "policy": {
            "id": policy.id,
            "customer_id": policy.customer_id,
            "policy_number": policy.policy_number,
            "insurer_name": policy.insurer_name,
            "product_name": policy.product_name,
            "insurance_type": policy.insurance_type,
            "premium": policy.premium,
            "idv": policy.idv,
            "coverage_amount": policy.coverage_amount,
            "deductible": policy.deductible,
            "vehicle_registration": policy.vehicle_registration,
            "vehicle_make": policy.vehicle_make,
            "vehicle_model": policy.vehicle_model,
            "ncb_percent": policy.ncb_percent,
            "addons": policy.addons,
            "status": policy.status,
            "active": policy.active,
            "start_date": policy.start_date.strftime("%Y-%m-%d") if policy.start_date else None,
            "end_date": policy.end_date.strftime("%Y-%m-%d") if policy.end_date else None,
        }
    }
