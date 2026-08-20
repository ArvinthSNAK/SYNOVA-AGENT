from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.repositories.user_repository import UserRepository


class AuthServiceError(ValueError):
    pass


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)

    def register(self, email: str, password: str, full_name: str = "") -> dict:
        existing = self.users.get_by_email(email)
        if existing:
            raise AuthServiceError("Email already registered")

        hashed = hash_password(password)
        user = self.users.create(email=email, hashed_password=hashed, full_name=full_name)
        self.db.commit()
        self.db.refresh(user)

        return {"id": user.id, "email": user.email, "full_name": user.full_name}

    def login(self, email: str, password: str) -> dict:
        user = self.users.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise AuthServiceError("Invalid credentials")

        if not user.is_active:
            raise AuthServiceError("Account is inactive")

        token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role},
        }