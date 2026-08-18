from sqlalchemy.orm import Session
from app.model.wallet import Wallet
from app.schema.wallet import WalletCreate


def create_wallet_policy(db: Session, wallet_data: WalletCreate):
    wallet = Wallet(
        user_id=wallet_data.user_id,
        policy_number=wallet_data.policy_number,
        insurer_name=wallet_data.insurer_name,
        policy_type=wallet_data.policy_type,
        premium=wallet_data.premium,
        status=wallet_data.status
    )

    db.add(wallet)
    db.commit()
    db.refresh(wallet)

    return wallet


def get_wallet_by_user(db: Session, user_id: int):
    return db.query(Wallet).filter(Wallet.user_id == user_id).all()