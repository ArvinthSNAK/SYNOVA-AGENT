from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schema.notification import (
    NotificationCreate,
    NotificationResponse
)
from app.service.notification_service import (
    create_notification,
    get_notifications_by_user,
    mark_notification_as_read
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.post("/", response_model=NotificationResponse)
def create_new_notification(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db)
):
    return create_notification(db, notification_data)


@router.get(
    "/{user_id}",
    response_model=list[NotificationResponse]
)
def get_user_notifications(
    user_id: int,
    db: Session = Depends(get_db)
):
    return get_notifications_by_user(db, user_id)


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def read_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):
    return mark_notification_as_read(db, notification_id)