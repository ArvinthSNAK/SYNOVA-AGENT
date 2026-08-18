from sqlalchemy.orm import Session
from app.model.notification import Notification
from app.schema.notification import NotificationCreate


def create_notification(
    db: Session,
    notification_data: NotificationCreate
):
    notification = Notification(
        user_id=notification_data.user_id,
        title=notification_data.title,
        message=notification_data.message,
        notification_type=notification_data.notification_type
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


def get_notifications_by_user(db: Session, user_id: int):
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .all()
    )


def mark_notification_as_read(
    db: Session,
    notification_id: int
):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id)
        .first()
    )

    if notification:
        notification.is_read = True
        db.commit()
        db.refresh(notification)

    return notification