"""
Notification Service.

When a new product is added, identifies customers who could benefit
from it based on their existing policies, and queues email notifications.
"""
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.notification_model import Notification
from app.models.policy_model import Policy
from app.models.insurance_product_model import InsuranceProduct


class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def notify_eligible_customers_for_new_product(self, product_id: int) -> list[dict]:
        product = self.db.query(InsuranceProduct).filter(InsuranceProduct.id == product_id).first()
        if product is None:
            return []

        eligible_policies = (
            self.db.query(Policy)
            .filter(
                Policy.insurance_type == product.insurance_type,
                Policy.active == True,
            )
            .all()
        )

        notifications_created = []

        seen_customers = set()
        for policy in eligible_policies:
            if policy.customer_id in seen_customers:
                continue
            seen_customers.add(policy.customer_id)

            benefit_reasons = self._check_benefit(policy, product)
            if not benefit_reasons:
                continue

            subject = f"A new {product.insurance_type} insurance option may provide better coverage"
            message = self._build_message(policy, product, benefit_reasons)

            notification = Notification(
                customer_id=policy.customer_id,
                notification_type="new_product_alert",
                subject=subject,
                message=message,
                metadata_json={
                    "product_id": product_id,
                    "product_name": product.name,
                    "policy_id": policy.id,
                    "benefit_reasons": benefit_reasons,
                },
                status="pending",
            )
            self.db.add(notification)
            notifications_created.append({
                "customer_id": policy.customer_id,
                "subject": subject,
                "reasons": benefit_reasons,
            })

        if notifications_created:
            self.db.commit()

        return notifications_created

    def _check_benefit(self, policy: Policy, product: InsuranceProduct) -> list[str]:
        reasons = []

        if product.base_premium and policy.premium:
            if product.base_premium < policy.premium * 0.9:
                reasons.append("Potentially lower premium")

        if hasattr(product, "coverage_limit") and product.coverage_limit:
            if policy.coverage_amount and product.coverage_limit > policy.coverage_amount:
                reasons.append(f"Higher coverage: ₹{product.coverage_limit:,.0f} vs your current ₹{policy.coverage_amount:,.0f}")

        if hasattr(product, "idv_range_max") and product.idv_range_max:
            if policy.idv and product.idv_range_max > policy.idv:
                reasons.append("Higher IDV available")

        if not reasons:
            reasons.append("New coverage options available that may complement your current policy")

        return reasons

    def _build_message(self, policy: Policy, product: InsuranceProduct, reasons: list[str]) -> str:
        lines = [
            f"Hi,",
            f"",
            f"We noticed a new insurance product that may benefit you:",
            f"",
            f"Product: {product.name}",
            f"Type: {product.insurance_type}",
            f"",
            f"Your current policy:",
            f"  Insurer: {policy.insurer_name or 'N/A'}",
            f"  Premium: ₹{policy.premium:,.0f}" if policy.premium else "  Premium: N/A",
            f"  IDV: ₹{policy.idv:,.0f}" if policy.idv else "  IDV: N/A",
            f"",
            f"Why this may be relevant:",
        ]
        for r in reasons:
            lines.append(f"  - {r}")

        lines.append("")
        lines.append("Log in to compare quotes and see if this is a good fit for you.")
        return "\n".join(lines)

    def get_notifications_for_customer(self, customer_id: int) -> list[dict]:
        notifications = (
            self.db.query(Notification)
            .filter(Notification.customer_id == customer_id, Notification.active == True)
            .order_by(Notification.created_at.desc())
            .limit(50)
            .all()
        )
        return [
            {
                "id": n.id,
                "type": n.notification_type,
                "subject": n.subject,
                "message": n.message,
                "status": n.status,
                "created_at": n.created_at,
            }
            for n in notifications
        ]

    def send_pending_notifications(self) -> int:
        pending = (
            self.db.query(Notification)
            .filter(Notification.status == "pending")
            .all()
        )
        sent_count = 0
        for n in pending:
            n.status = "sent"
            n.sent_at = datetime.utcnow()
            sent_count += 1

        if sent_count:
            self.db.commit()
        return sent_count
