from pydantic import BaseModel


class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    notification_type: str


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool

    class Config:
        from_attributes = True