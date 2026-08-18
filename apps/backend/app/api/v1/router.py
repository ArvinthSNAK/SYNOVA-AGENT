from fastapi import APIRouter
from app.api.v1.routes import (
    admin_routes,
    quote_routes,
    document_routes,
    wallet_routes,
    notification_routes,
    auth_routes,
    application_routes,
    policy_routes,
    renewal_routes,
)

router = APIRouter()

router.include_router(admin_routes.router)
router.include_router(quote_routes.router)
router.include_router(document_routes.router)
router.include_router(wallet_routes.router)
router.include_router(notification_routes.router)
router.include_router(auth_routes.router)
router.include_router(application_routes.router)
router.include_router(policy_routes.router)
router.include_router(renewal_routes.router)
