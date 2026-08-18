from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schema.wallet import WalletCreate
from app.service.wallet_service import create_wallet_policy


router = APIRouter(
    prefix="/wallet",
    tags=["Wallet"]
)


@router.post("/upload")
async def upload_policy_document(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(".txt"):
        raise HTTPException(
            status_code=400,
            detail="For now, upload a .txt policy document."
        )

    content = await file.read()

    text = content.decode("utf-8")

    lines = text.splitlines()

    policy_number = lines[0].split(":", 1)[1].strip()
    insurer_name = lines[1].split(":", 1)[1].strip()
    policy_type = lines[2].split(":", 1)[1].strip()
    premium = float(lines[3].split(":", 1)[1].strip())
    status = lines[4].split(":", 1)[1].strip()

    wallet_data = WalletCreate(
        user_id=user_id,
        policy_number=policy_number,
        insurer_name=insurer_name,
        policy_type=policy_type,
        premium=premium,
        status=status
    )

    wallet = create_wallet_policy(db, wallet_data)

    return {
        "message": "Policy document processed and added to wallet",
        "wallet": wallet
    }