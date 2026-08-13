
from fastapi import APIRouter

from app.api.v1.routes.chat_routes import router as chat_router

router = APIRouter()

router.include_router(
    chat_router,
    prefix="/api/v1"
)