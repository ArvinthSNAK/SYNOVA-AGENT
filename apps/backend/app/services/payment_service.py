import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.payment_model import PaymentOrder, PaymentTransaction
from app.models.policy_model import Policy
from app.models.policy_version_model import PolicyVersion
from app.models.insurance_product_model import InsuranceProduct
from app.models.notification_model import Notification


class PaymentService:
    """Payment Gateway Service with Sandbox / Test verification and policy generation."""

    def __init__(self, db: Session):
        self.db = db

    def create_order(
        self,
        customer_id: Optional[int],
        product_id: Optional[Any],
        amount: float,
        application_data: Optional[Dict[str, Any]] = None,
        payment_method: str = "upi",
    ) -> Dict[str, Any]:
        """Creates a pending payment order."""
        app_data = application_data or {}
        product = None

        # 1. Try lookup by integer product_id if provided
        if product_id is not None:
            try:
                pid = int(product_id)
                product = self.db.query(InsuranceProduct).filter(InsuranceProduct.id == pid).first()
            except (ValueError, TypeError):
                pass

        # 2. Try lookup by product name or plan name
        if not product and app_data:
            p_name = app_data.get("product_name") or app_data.get("name") or app_data.get("plan_name")
            if p_name:
                product = self.db.query(InsuranceProduct).filter(InsuranceProduct.name.ilike(f"%{p_name}%")).first()

        # 3. Try lookup by category / insurance_type
        if not product and app_data:
            cat = app_data.get("category") or app_data.get("insurance_type")
            if cat:
                product = self.db.query(InsuranceProduct).filter(InsuranceProduct.insurance_type == cat).first()

        # 4. Fallback to any active product
        if not product:
            product = self.db.query(InsuranceProduct).first()

        product_id_val = product.id if product else (int(product_id) if product_id and str(product_id).isdigit() else 1)
        product_name_val = product.name if product else app_data.get("product_name", app_data.get("name", "Comprehensive Shield"))
        insurer_name_val = (product.insurer.name if product and product.insurer else None) or app_data.get("insurer_name", "ICICI Lombard General")
        category_val = (product.insurance_type if product else None) or app_data.get("category", app_data.get("insurance_type", "motor"))

        order_id = f"ORDER_{uuid.uuid4().hex[:12].upper()}"
        gateway_order_id = f"pg_sand_{uuid.uuid4().hex[:16]}"

        order = PaymentOrder(
            order_id=order_id,
            customer_id=customer_id or 1,
            product_id=product_id_val,
            product_name=product_name_val,
            insurer_name=insurer_name_val,
            category=category_val,
            amount=round(amount, 2),
            currency="INR",
            status="created",
            payment_method=payment_method,
            gateway_order_id=gateway_order_id,
            application_data=app_data,
        )
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)

        return {
            "order_id": order.order_id,
            "gateway_order_id": order.gateway_order_id,
            "amount": order.amount,
            "currency": order.currency,
            "product_name": order.product_name,
            "insurer_name": order.insurer_name,
            "category": order.category,
            "status": order.status,
        }

    def verify_payment(
        self,
        order_id: str,
        payment_id: Optional[str] = None,
        payment_signature: Optional[str] = None,
        simulated_status: str = "success",
    ) -> Dict[str, Any]:
        """Verifies payment transaction server-side and issues the policy automatically."""
        order = self.db.query(PaymentOrder).filter(PaymentOrder.order_id == order_id).first()
        if not order:
            raise ValueError(f"Payment order '{order_id}' not found")

        if order.status == "success":
            # Already verified
            tx = self.db.query(PaymentTransaction).filter(PaymentTransaction.order_id == order_id).first()
            return {
                "verified": True,
                "status": "success",
                "order_id": order.order_id,
                "policy_number": tx.policy_number if tx else None,
                "policy_id": tx.policy_id if tx else None,
            }

        tx_id = f"TXN_{uuid.uuid4().hex[:12].upper()}"
        pg_payment_id = payment_id or f"pay_sand_{uuid.uuid4().hex[:16]}"

        if simulated_status != "success":
            order.status = "failed"
            self.db.commit()
            return {"verified": False, "status": "failed", "error": "Payment was declined by payment gateway"}

        # 1. Update Order Status
        order.status = "success"

        # 2. Generate Policy Record
        cat_prefix = {"motor": "MOT", "health": "HLT", "term": "TRM"}.get(order.category, "POL")
        policy_num = f"SYN-{cat_prefix}-{datetime.now().year}-{uuid.uuid4().hex[:8].upper()}"
        
        app_data = order.application_data or {}
        cov_amt = app_data.get("coverage_amount", 500000.0)
        
        now = datetime.now()
        end_date = now + timedelta(days=365)

        policy = Policy(
            customer_id=order.customer_id or 1,
            insurer_id=None,
            product_id=order.product_id,
            policy_number=policy_num,
            insurance_type=order.category or "health",
            insurer_name=order.insurer_name,
            product_name=order.product_name,
            status="active",
            premium=order.amount,
            coverage_amount=cov_amt,
            idv=app_data.get("idv", cov_amt),
            deductible=app_data.get("deductible", 0.0),
            start_date=now,
            end_date=end_date,
            vehicle_registration=app_data.get("vehicle_registration"),
            vehicle_make=app_data.get("vehicle_make"),
            vehicle_model=app_data.get("vehicle_model"),
            ncb_percent=app_data.get("ncb_percent", 0.0),
            addons=", ".join(app_data.get("addons", [])) if isinstance(app_data.get("addons"), list) else str(app_data.get("addons", "")),
            notes=f"Digitally issued via Synova Sandbox Gateway. Order: {order.order_id}",
            active=True,
        )
        self.db.add(policy)
        self.db.flush()

        # 3. Create Policy Version
        version = PolicyVersion(
            policy_id=policy.id,
            version=1,
            effective_from=now,
            data={"policy_number": policy.policy_number, "document_url": f"/policies/download/{policy.id}"},
        )
        self.db.add(version)

        # 4. Record Payment Transaction
        transaction = PaymentTransaction(
            transaction_id=tx_id,
            order_id=order.order_id,
            payment_id=pg_payment_id,
            amount=order.amount,
            currency="INR",
            status="success",
            gateway_response={"gateway": "Synova Sandbox Gateway v2", "verified_at": now.isoformat()},
            verified_at=now,
            policy_id=policy.id,
            policy_number=policy.policy_number,
        )
        self.db.add(transaction)

        # 5. Push Notification
        notif = Notification(
            customer_id=order.customer_id or 1,
            subject="Policy Issued & Active",
            message=f"Your {order.insurer_name} {order.product_name} policy ({policy_num}) has been issued and stored in your Digital Policy Vault.",
            notification_type="policy_issued",
        )
        self.db.add(notif)

        self.db.commit()

        return {
            "verified": True,
            "status": "success",
            "order_id": order.order_id,
            "transaction_id": transaction.transaction_id,
            "payment_id": transaction.payment_id,
            "policy_id": policy.id,
            "policy_number": policy.policy_number,
            "insurer_name": policy.insurer_name,
            "product_name": policy.product_name,
            "coverage_amount": policy.coverage_amount,
            "start_date": policy.start_date.isoformat(),
            "end_date": policy.end_date.isoformat(),
        }
