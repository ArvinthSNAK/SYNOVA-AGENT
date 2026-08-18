from fastapi import FastAPI

from app.database import Base, engine

from app.model.user import User
from app.model.wallet import Wallet
from app.model.notification import Notification
from app.model.insurer_snapshot import InsurerSnapshot

from app.router.user_router import router as user_router
from app.router.wallet_router import router as wallet_router
from app.router.notification_router import router as notification_router
from app.router.insurer_router import router as insurer_router
from app.router.wallet_upload_router import router as wallet_upload_router


app = FastAPI()


Base.metadata.create_all(bind=engine)


app.include_router(user_router)
app.include_router(wallet_router)
app.include_router(notification_router)
app.include_router(insurer_router)
app.include_router(wallet_upload_router)


@app.get("/")
def root():
    return {
        "message": "Insurance Agent Backend is running"
    }