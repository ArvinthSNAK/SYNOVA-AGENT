from sqlalchemy.orm import Session
from app.model.user import User
from app.schema.user import UserCreate


def create_user(db: Session, user_data: UserCreate):
    user = User(
        name=user_data.name,
        email=user_data.email,
        password=user_data.password,
        role=user_data.role
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()