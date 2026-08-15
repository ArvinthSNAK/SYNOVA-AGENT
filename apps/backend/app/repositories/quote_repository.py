from sqlalchemy.orm import Session
from app.models.quote_model import Quote
from app.models.quote_item_model import QuoteItem


class QuoteRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_quote(
        self,
        insurer_id: int,
        product_id: int,
        total_premium: float,
        application_id: int | None = None,
        customer_id: int | None = None,
        status: str = "draft",
    ) -> Quote:
        quote = Quote(
            insurer_id=insurer_id,
            product_id=product_id,
            total_premium=total_premium,
            application_id=application_id,
            customer_id=customer_id,
            status=status,
        )
        self.db.add(quote)
        self.db.flush()  # get quote.id without committing yet
        return quote

    def add_quote_items(self, quote_id: int, breakdown: list[dict]) -> list[QuoteItem]:
        items = []
        for entry in breakdown:
            item = QuoteItem(
                quote_id=quote_id,
                code=entry["rule_type"],
                description=entry["rule"],
                amount=entry["value"],
                meta={"running_total": entry["running_total"]},
            )
            self.db.add(item)
            items.append(item)
        self.db.flush()
        return items

    def get_by_id(self, quote_id: int) -> Quote | None:
        return self.db.query(Quote).filter(Quote.id == quote_id).first()