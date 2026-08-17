from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.policy_model import Policy


class WalletService:
    def __init__(self, db: Session):
        self.db = db

    def get_insurance_vault(self, customer_id: int) -> dict:
        policies = (
            self.db.query(Policy)
            .filter(Policy.customer_id == customer_id, Policy.active == True)
            .all()
        )

        now = datetime.utcnow()
        thirty_days = now + timedelta(days=30)

        active = []
        expiring_soon = []
        expired = []

        for p in policies:
            if p.end_date and p.end_date < now:
                p.status = "expired"
                expired.append(p)
            elif p.end_date and p.end_date <= thirty_days:
                p.status = "expiring_soon"
                expiring_soon.append(p)
                active.append(p)
            else:
                active.append(p)

        by_type: dict[str, list] = {}
        for p in policies:
            t = p.insurance_type or "other"
            by_type.setdefault(t, []).append(p)

        return {
            "customer_id": customer_id,
            "total_policies": len(policies),
            "active_count": len(active),
            "expiring_soon_count": len(expiring_soon),
            "expired_count": len(expired),
            "policies_by_type": by_type,
        }
