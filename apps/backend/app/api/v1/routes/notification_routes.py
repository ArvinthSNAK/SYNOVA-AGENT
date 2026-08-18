from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.postgres.session import get_db
from app.services.notification.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/{customer_id}")
def get_notifications(customer_id: int, db: Session = Depends(get_db)):
    svc = NotificationService(db)
    return svc.get_notifications_for_customer(customer_id)


@router.post("/send-pending")
def send_pending(db: Session = Depends(get_db)):
    svc = NotificationService(db)
    count = svc.send_pending_notifications()
    return {"sent": count}
