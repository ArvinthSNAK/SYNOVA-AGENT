from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List

from app.db.postgres.session import get_db
from app.controllers.wallet_controller import WalletController
from app.schemas.wallet_schema import InsuranceVaultResponse
from app.services.claims_service import ClaimsService, ClaimsServiceError
from app.schemas.claims_schema import FNOLRequest
from app.models.wallet_model import Wallet, WalletTransaction
from app.models.user_model import User
from app.auth.dependencies import get_current_user

router = APIRouter(tags=["wallet"])


class AddFundsRequest(BaseModel):
    amount: float = Field(..., gt=0)
    payment_method: str = "UPI"


class PayPremiumRequest(BaseModel):
    amount: float = Field(..., gt=0)
    policy_id: Optional[int] = None
    policy_number: Optional[str] = None
    insurer_name: Optional[str] = None


# Customer Insurance Vault Routes
@router.get("/customers/{customer_id}/insurance-vault", response_model=InsuranceVaultResponse)
def get_insurance_vault(customer_id: int, db: Session = Depends(get_db)):
    controller = WalletController(db)
    return controller.get_vault(customer_id)


@router.get("/customers/{customer_id}/claims")
def get_customer_claims(customer_id: int, db: Session = Depends(get_db)):
    svc = ClaimsService(db)
    return svc.get_claims_by_customer(customer_id)


@router.post("/customers/{customer_id}/claims/fnol")
def submit_customer_fnol(customer_id: int, payload: FNOLRequest, db: Session = Depends(get_db)):
    svc = ClaimsService(db)
    try:
        inc_date = None
        if payload.incident_date:
            try:
                inc_date = datetime.fromisoformat(payload.incident_date.replace("Z", "+00:00"))
            except Exception:
                inc_date = datetime.utcnow()

        return svc.submit_fnol(
            customer_id=customer_id,
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


# Dedicated Wallet Routes
@router.get("/wallet/me")
def get_my_wallet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        wallet = Wallet(user_id=current_user.id, balance=25000.0, currency="INR", active=True)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
        
        # Initial credit log
        tx = WalletTransaction(
            wallet_id=wallet.id,
            user_id=current_user.id,
            amount=25000.0,
            transaction_type="CREDIT",
            description="Welcome Onboarding Credit",
            reference_id="INIT-BONUS",
        )
        db.add(tx)
        db.commit()
        db.refresh(wallet)

    txs = db.query(WalletTransaction).filter(WalletTransaction.user_id == current_user.id).order_by(WalletTransaction.created_at.desc()).limit(20).all()
    
    return {
        "wallet_id": wallet.id,
        "user_id": current_user.id,
        "balance": wallet.balance,
        "currency": wallet.currency,
        "transactions": [
            {
                "id": t.id,
                "amount": t.amount,
                "transaction_type": t.transaction_type,
                "description": t.description,
                "reference_id": t.reference_id,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in txs
        ]
    }


@router.post("/wallet/add-funds")
def add_funds(
    payload: AddFundsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        wallet = Wallet(user_id=current_user.id, balance=25000.0, currency="INR", active=True)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)

    wallet.balance += payload.amount
    tx = WalletTransaction(
        wallet_id=wallet.id,
        user_id=current_user.id,
        amount=payload.amount,
        transaction_type="TOPUP",
        description=f"Wallet Top-up via {payload.payment_method}",
        reference_id=f"PAY-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
    )
    db.add(tx)
    db.commit()
    db.refresh(wallet)

    return {
        "message": "Funds added successfully",
        "new_balance": wallet.balance,
        "added_amount": payload.amount,
    }


@router.post("/wallet/pay")
def pay_with_wallet(
    payload: PayPremiumRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        wallet = Wallet(user_id=current_user.id, balance=25000.0, currency="INR", active=True)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)

    if wallet.balance < payload.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient wallet balance. Current: ₹{wallet.balance:,.2f}, Required: ₹{payload.amount:,.2f}",
        )

    wallet.balance -= payload.amount
    tx = WalletTransaction(
        wallet_id=wallet.id,
        user_id=current_user.id,
        amount=payload.amount,
        transaction_type="PREMIUM_PAYMENT",
        description=f"Policy Premium Payment - {payload.insurer_name or 'Insurance'}",
        reference_id=payload.policy_number or f"POL-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
    )
    db.add(tx)
    db.commit()
    db.refresh(wallet)

    return {
        "status": "SUCCESS",
        "message": "Premium paid successfully from wallet",
        "remaining_balance": wallet.balance,
        "transaction_id": tx.id,
    }
