from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.postgres.session import get_db
from app.services.payment_service import PaymentService
from app.schemas.payment_schema import CreateOrderRequest, VerifyPaymentRequest
from app.models.payment_model import PaymentOrder, PaymentTransaction

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/create-order")
def create_payment_order(payload: CreateOrderRequest, db: Session = Depends(get_db)):
    """Creates a server-side payment order."""
    service = PaymentService(db)
    try:
        return service.create_order(
            customer_id=payload.customer_id,
            product_id=payload.product_id,
            amount=payload.amount,
            application_data=payload.application_data or {},
            payment_method=payload.payment_method or "upi",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/verify")
def verify_payment(payload: VerifyPaymentRequest, db: Session = Depends(get_db)):
    """Verifies payment transaction server-side and issues the policy upon success."""
    service = PaymentService(db)
    try:
        res = service.verify_payment(
            order_id=payload.order_id,
            payment_id=payload.payment_id,
            payment_signature=payload.signature,
            simulated_status=payload.simulated_status or "success",
        )
        if not res.get("verified"):
            raise HTTPException(status_code=402, detail=res.get("error", "Payment verification failed"))
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/webhook")
def payment_webhook(payload: dict, db: Session = Depends(get_db)):
    """Receives asynchronous gateway webhook notifications."""
    order_id = payload.get("order_id")
    event = payload.get("event", "payment.captured")
    if not order_id:
        return {"status": "ignored", "reason": "No order_id"}

    service = PaymentService(db)
    if event in ["payment.captured", "payment.success"]:
        return service.verify_payment(order_id=order_id, simulated_status="success")
    return {"status": "received", "event": event}


@router.get("/{payment_id}")
def get_payment_details(payment_id: str, db: Session = Depends(get_db)):
    """Retrieves payment order and transaction details."""
    order = db.query(PaymentOrder).filter(PaymentOrder.order_id == payment_id).first()
    if not order:
        order = db.query(PaymentOrder).filter(PaymentOrder.gateway_order_id == payment_id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Payment order {payment_id} not found")

    tx = db.query(PaymentTransaction).filter(PaymentTransaction.order_id == order.order_id).first()

    return {
        "order_id": order.order_id,
        "amount": order.amount,
        "currency": order.currency,
        "status": order.status,
        "product_name": order.product_name,
        "insurer_name": order.insurer_name,
        "payment_method": order.payment_method,
        "transaction_id": tx.transaction_id if tx else None,
        "policy_number": tx.policy_number if tx else None,
        "policy_id": tx.policy_id if tx else None,
    }
