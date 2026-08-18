from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schema.wallet import WalletCreate, WalletResponse
from app.service.wallet_service import (
    create_wallet_policy,
    get_wallet_by_user
)


router = APIRouter(
    prefix="/wallet",
    tags=["Wallet"]
)


@router.post("/", response_model=WalletResponse)
def add_policy_to_wallet(
    wallet_data: WalletCreate,
    db: Session = Depends(get_db)
):
    return create_wallet_policy(db, wallet_data)


@router.get("/{user_id}", response_model=list[WalletResponse])
def get_user_wallet(
    user_id: int,
    db: Session = Depends(get_db)
):
    return get_wallet_by_user(db, user_id)