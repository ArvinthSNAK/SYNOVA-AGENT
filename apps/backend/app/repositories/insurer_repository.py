from sqlalchemy.orm import Session
from app.models import Insurer


class InsurerRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, *, name: str, description: str | None = None, active: bool = True) -> Insurer:
        insurer = Insurer(name=name, description=description, active=active)
        self.db.add(insurer)
        self.db.flush()
        return insurer

    def get(self, insurer_id: int) -> Insurer | None:
        return self.db.query(Insurer).filter(Insurer.id == insurer_id).one_or_none()

    def list(self, limit: int = 100, offset: int = 0):
        return self.db.query(Insurer).order_by(Insurer.id).limit(limit).offset(offset).all()
