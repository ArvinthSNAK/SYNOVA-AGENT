from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.db.postgres.session import get_db

router = APIRouter(prefix="/renewals", tags=["renewals"])


class RenewalRequest(BaseModel):
    customer_id: int
    policy_id: int
    document_id: Optional[int] = None


@router.post("/initiate")
def initiate_renewal(payload: RenewalRequest, db: Session = Depends(get_db)):
    from app.models.policy_model import Policy
    policy = db.query(Policy).filter(Policy.id == payload.policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    return {
        "renewal_initiated": True,
        "policy_id": policy.id,
        "insurance_type": policy.insurance_type,
        "current_premium": policy.premium,
        "current_idv": policy.idv,
        "message": "Upload previous policy PDF or proceed with existing data",
    }
