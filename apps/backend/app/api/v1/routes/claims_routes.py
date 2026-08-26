from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.postgres.session import get_db
from app.services.claims_service import ClaimsService, ClaimsServiceError
from app.schemas.claims_schema import FNOLRequest, ClaimStatusUpdateRequest

router = APIRouter(prefix="/claims", tags=["claims"])


@router.post("/fnol")
def submit_fnol(payload: FNOLRequest, db: Session = Depends(get_db)):
    svc = ClaimsService(db)
    try:
        inc_date = None
        if payload.incident_date:
            try:
                inc_date = datetime.fromisoformat(payload.incident_date.replace("Z", "+00:00"))
            except Exception:
                inc_date = datetime.utcnow()

        return svc.submit_fnol(
            customer_id=payload.customer_id or 1,
            policy_id=payload.policy_id,
            claim_type=payload.claim_type,
            incident_date=inc_date,
            incident_location=payload.incident_location,
            description=payload.description,
            estimated_loss=payload.estimated_loss,
            garage_name=payload.garage_name or "",
            garage_city=payload.garage_city or "",
            documents=payload.documents,
        )
    except ClaimsServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/customer/{customer_id}")
def get_customer_claims(customer_id: int, db: Session = Depends(get_db)):
    svc = ClaimsService(db)
    return svc.get_claims_by_customer(customer_id)


@router.get("/{claim_id}")
def get_claim(claim_id: int, db: Session = Depends(get_db)):
    svc = ClaimsService(db)
    claim = svc.get_claim_by_id(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim


@router.put("/{claim_id}/status")
def update_claim_status(claim_id: int, payload: ClaimStatusUpdateRequest, db: Session = Depends(get_db)):
    svc = ClaimsService(db)
    try:
        return svc.update_claim_status(
            claim_id=claim_id,
            new_status=payload.status,
            approved_amount=payload.approved_amount,
            surveyor_notes=payload.surveyor_notes,
        )
    except ClaimsServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))
