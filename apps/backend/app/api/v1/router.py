from fastapi import APIRouter
from app.api.v1.routes import admin_routes, quote_routes, document_routes

router = APIRouter()

router.include_router(admin_routes.router)
router.include_router(quote_routes.router)
router.include_router(document_routes.router)