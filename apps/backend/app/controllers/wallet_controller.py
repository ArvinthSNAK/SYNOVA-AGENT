from sqlalchemy.orm import Session

from app.services.wallet_service import WalletService


class WalletController:
    def __init__(self, db: Session):
        self.service = WalletService(db)

    def get_vault(self, customer_id: int) -> dict:
        return self.service.get_insurance_vault(customer_id)
