from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Any, Dict

from app.db.postgres.session import get_db

router = APIRouter(prefix="/applications", tags=["applications"])


class NewApplicationRequest(BaseModel):
    customer_id: int
    insurance_type: str = "motor"
    vehicle: Dict[str, Any] = {}
    customer_details: Dict[str, Any] = {}
    driver: Dict[str, Any] = {}


class RenewalApplicationRequest(BaseModel):
    customer_id: int
    document_id: int
    insurance_type: str = "motor"
    overrides: Dict[str, Any] = {}


@router.post("/new")
def create_new_application(payload: NewApplicationRequest, db: Session = Depends(get_db)):
    from app.models.application_model import Application
    app = Application(
        customer_id=payload.customer_id,
        insurance_type=payload.insurance_type,
        application_type="new",
        status="draft",
        data={
            "vehicle": payload.vehicle,
            "customer_details": payload.customer_details,
            "driver": payload.driver,
        },
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return {"id": app.id, "status": app.status, "type": "new"}


@router.post("/renewal")
def create_renewal_application(payload: RenewalApplicationRequest, db: Session = Depends(get_db)):
    from app.models.application_model import Application
    from app.repositories.extracted_policy_data_repository import ExtractedPolicyDataRepository
    repo = ExtractedPolicyDataRepository(db)
    extracted = repo.get_by_document_id(payload.document_id)
    data = {}
    if extracted:
        data = {
            "previous_policy": {
                "customer_name": extracted.customer_name,
                "policy_number": extracted.policy_number,
                "vehicle_registration": extracted.vehicle_registration,
                "idv": extracted.idv,
                "premium": extracted.premium,
                "ncb": extracted.ncb,
            },
            "overrides": payload.overrides,
        }
    app = Application(
        customer_id=payload.customer_id,
        insurance_type=payload.insurance_type,
        application_type="renewal",
        status="draft",
        data=data,
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return {"id": app.id, "status": app.status, "type": "renewal"}


@router.get("/{application_id}")
def get_application(application_id: int, db: Session = Depends(get_db)):
    from app.models.application_model import Application
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Application not found")
    return {"id": app.id, "status": app.status, "type": app.application_type, "data": app.data}
