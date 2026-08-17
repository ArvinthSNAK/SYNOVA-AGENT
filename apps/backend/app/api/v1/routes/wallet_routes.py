from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.postgres.session import get_db
from app.controllers.wallet_controller import WalletController
from app.schemas.wallet_schema import InsuranceVaultResponse

router = APIRouter(prefix="/customers", tags=["insurance-vault"])


@router.get("/{customer_id}/insurance-vault", response_model=InsuranceVaultResponse)
def get_insurance_vault(customer_id: int, db: Session = Depends(get_db)):
    controller = WalletController(db)
    return controller.get_vault(customer_id)
