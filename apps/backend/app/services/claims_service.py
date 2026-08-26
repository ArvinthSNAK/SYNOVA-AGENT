import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.models.claims_model import Claim
from app.models.policy_model import Policy
from app.models.notification_model import Notification


class ClaimsServiceError(ValueError):
    pass


class ClaimsService:
    def __init__(self, db: Session):
        self.db = db

    def submit_fnol(
        self,
        customer_id: int,
        policy_id: int,
        claim_type: str,
        incident_date: Optional[datetime],
        incident_location: str,
        description: str,
        estimated_loss: float,
        garage_name: str = "",
        garage_city: str = "",
        documents: Optional[list] = None,
    ) -> dict:
        policy = self.db.query(Policy).filter(Policy.id == policy_id, Policy.customer_id == customer_id).first()
        if not policy:
            raise ClaimsServiceError("Policy not found or does not belong to this customer")

        claim_number = f"CLM-{datetime.utcnow().year}-{str(uuid.uuid4())[:8].upper()}"
        deductible = float(policy.deductible or 1500.0)

        # Initial provisional estimation
        provisional_approved = max(0.0, float(estimated_loss) * 0.85)
        net_payout = max(0.0, provisional_approved - deductible)

        claim = Claim(
            claim_number=claim_number,
            policy_id=policy_id,
            customer_id=customer_id,
            claim_type=claim_type,
            status="SUBMITTED",
            incident_date=incident_date or datetime.utcnow(),
            incident_location=incident_location,
            description=description,
            estimated_loss=estimated_loss,
            approved_amount=provisional_approved,
            deductible_applied=deductible,
            net_payout=net_payout,
            surveyor_name="Rajesh Sharma (Senior Claims Surveyor)",
            surveyor_contact="+91 98200 12345",
            surveyor_notes="Initial FNOL recorded. Digital inspection scheduled with cashless garage network.",
            garage_name=garage_name or "Authorized Cashless Service Hub",
            garage_city=garage_city or "Bangalore",
            documents_json=documents or ["Incident_Photos.jpg", "Estimate_Bill.pdf"],
            active=True,
        )
        self.db.add(claim)
        
        # Trigger notification
        notif = Notification(
            customer_id=customer_id,
            notification_type="CLAIM_UPDATE",
            subject=f"Claim #{claim_number} Registered Successfully",
            message=f"Your First Notice of Loss (FNOL) for {policy.product_name or 'Policy'} has been recorded. Surveyor Rajesh Sharma has been assigned.",
            metadata_json={"claim_number": claim_number, "policy_id": policy_id, "status": "SUBMITTED"},
            status="sent",
        )
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(claim)

        return self._format_claim(claim, policy)

    def get_claims_by_customer(self, customer_id: int) -> list[dict]:
        claims = self.db.query(Claim).filter(Claim.customer_id == customer_id, Claim.active == True).order_by(Claim.created_at.desc()).all()
        result = []
        for c in claims:
            policy = self.db.query(Policy).filter(Policy.id == c.policy_id).first()
            result.append(self._format_claim(c, policy))
        return result

    def get_claim_by_id(self, claim_id: int) -> Optional[dict]:
        claim = self.db.query(Claim).filter(Claim.id == claim_id).first()
        if not claim:
            return None
        policy = self.db.query(Policy).filter(Policy.id == claim.policy_id).first()
        return self._format_claim(claim, policy)

    def update_claim_status(
        self,
        claim_id: int,
        new_status: str,
        approved_amount: Optional[float] = None,
        surveyor_notes: Optional[str] = None,
    ) -> dict:
        claim = self.db.query(Claim).filter(Claim.id == claim_id).first()
        if not claim:
            raise ClaimsServiceError("Claim not found")

        claim.status = new_status
        if approved_amount is not None:
            claim.approved_amount = approved_amount
            claim.net_payout = max(0.0, approved_amount - (claim.deductible_applied or 0.0))
        if surveyor_notes:
            claim.surveyor_notes = surveyor_notes

        self.db.commit()
        self.db.refresh(claim)
        policy = self.db.query(Policy).filter(Policy.id == claim.policy_id).first()
        return self._format_claim(claim, policy)

    def _format_claim(self, claim: Claim, policy: Optional[Policy]) -> dict:
        return {
            "id": claim.id,
            "claim_number": claim.claim_number,
            "policy_id": claim.policy_id,
            "customer_id": claim.customer_id,
            "policy_number": policy.policy_number if policy else "N/A",
            "insurer_name": policy.insurer_name if policy else "N/A",
            "vehicle_details": f"{policy.vehicle_make} {policy.vehicle_model} ({policy.vehicle_registration})" if policy and policy.vehicle_make else "General Policy",
            "claim_type": claim.claim_type,
            "status": claim.status,
            "incident_date": claim.incident_date.isoformat() if claim.incident_date else None,
            "incident_location": claim.incident_location,
            "description": claim.description,
            "estimated_loss": claim.estimated_loss,
            "approved_amount": claim.approved_amount,
            "deductible_applied": claim.deductible_applied,
            "net_payout": claim.net_payout,
            "surveyor_name": claim.surveyor_name,
            "surveyor_contact": claim.surveyor_contact,
            "surveyor_notes": claim.surveyor_notes,
            "garage_name": claim.garage_name,
            "garage_city": claim.garage_city,
            "documents": claim.documents_json or [],
            "created_at": claim.created_at.isoformat() if claim.created_at else None,
        }
