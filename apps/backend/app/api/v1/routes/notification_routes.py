from typing import Optional, List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.postgres.session import get_db
from app.models.notification_model import Notification
from app.models.user_model import User
from app.services.notification.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])


class TestNotificationRequest(BaseModel):
    customer_id: Optional[int] = 1
    subject: Optional[str] = "SYNOVA Security Alert: Policy Renewal Reminder"
    message: Optional[str] = "Your Comprehensive Motor Policy is due for renewal in 15 days."
    notification_type: Optional[str] = "RENEWAL_REMINDER"


class BroadcastNotificationRequest(BaseModel):
    title: str
    message: str
    insurer_name: Optional[str] = "Mock Insurer"
    product_name: Optional[str] = None
    notification_type: Optional[str] = "NEW_POLICY_LAUNCH"


@router.get("/")
def list_all_notifications(db: Session = Depends(get_db)):
    try:
        notifs = db.query(Notification).filter(Notification.active == True).order_by(Notification.id.desc()).limit(25).all()
        res = []
        for n in notifs:
            meta = n.metadata_json or {}
            res.append({
                "id": n.id,
                "title": n.subject or "Policy Alert",
                "subject": n.subject or "Policy Alert",
                "message": n.message,
                "insurer_name": meta.get("insurer_name", "General Insurance"),
                "product_name": meta.get("product_name", ""),
                "notification_type": n.notification_type,
                "status": n.status or "unread",
                "created_at": (
                    (n.created_at.isoformat() + ("Z" if not n.created_at.isoformat().endswith("Z") and "+" not in n.created_at.isoformat() else ""))
                    if hasattr(n, 'created_at') and n.created_at else None
                ),
            })
        return res
    except Exception as e:
        print(f"[List Notifications Error] {e}")
        return []


@router.post("/broadcast")
def broadcast_notification(payload: BroadcastNotificationRequest, db: Session = Depends(get_db)):
    try:
        users = db.query(User).all()
        created_notifs = []
        meta_dict = {
            "insurer_name": payload.insurer_name or "General Insurance",
            "product_name": payload.product_name or payload.title,
        }

        if not users:
            notif = Notification(
                customer_id=1,
                notification_type=payload.notification_type or "NEW_POLICY_LAUNCH",
                subject=payload.title,
                message=payload.message,
                metadata_json=meta_dict,
                status="unread",
                active=True,
            )
            db.add(notif)
            db.commit()
            db.refresh(notif)
            created_notifs.append(notif)
        else:
            for u in users:
                notif = Notification(
                    customer_id=u.id,
                    notification_type=payload.notification_type or "NEW_POLICY_LAUNCH",
                    subject=payload.title,
                    message=payload.message,
                    metadata_json=meta_dict,
                    status="unread",
                    active=True,
                )
                db.add(notif)
                created_notifs.append(notif)
            db.commit()

        return {
            "status": "broadcast_dispatched",
            "count": len(created_notifs),
            "notification": payload.dict()
        }
    except Exception as e:
        print(f"[Broadcast Notification Error] {e}")
        return {"status": "error", "detail": str(e)}


@router.post("/mark-all-read")
def mark_all_read(db: Session = Depends(get_db)):
    try:
        db.query(Notification).update({"status": "read"})
        db.commit()
        return {"status": "all_marked_read"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@router.get("/{customer_id}")
def get_notifications(customer_id: int, db: Session = Depends(get_db)):
    svc = NotificationService(db)
    return svc.get_notifications_for_customer(customer_id)


@router.post("/test")
def test_notification(payload: TestNotificationRequest, db: Session = Depends(get_db)):
    svc = NotificationService(db)
    return svc.send_custom_notification(
        customer_id=payload.customer_id or 1,
        notification_type=payload.notification_type or "RENEWAL_REMINDER",
        subject=payload.subject or "Policy Alert",
        message=payload.message or "Test alert body",
    )


@router.post("/trigger-product-alert/{product_id}")
def trigger_product_alert(product_id: int, db: Session = Depends(get_db)):
    svc = NotificationService(db)
    return svc.notify_eligible_customers_for_new_product(product_id)

