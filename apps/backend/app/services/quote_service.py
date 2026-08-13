from sqlalchemy.orm import Session

from app.models.insurance_product_model import InsuranceProduct
from app.repositories.quote_repository import QuoteRepository
from app.services.pricing.pricing_engine import calculate_premium, PricingEngineError


class QuoteServiceError(ValueError):
    pass


class QuoteService:
    def __init__(self, db: Session):
        self.db = db
        self.quotes = QuoteRepository(db)

    def calculate_quote(
        self,
        product_id: int,
        vehicle: dict,
        customer: dict,
        driver: dict,
        application_id: int | None = None,
        customer_id: int | None = None,
        save: bool = True,
    ) -> dict:
        product = (
            self.db.query(InsuranceProduct)
            .filter(InsuranceProduct.id == product_id)
            .first()
        )
        if product is None:
            raise QuoteServiceError(f"Product with id={product_id} not found")

        context = {"vehicle": vehicle, "customer": customer, "driver": driver}

        try:
            result = calculate_premium(self.db, product_id=product_id, input_context=context)
        except PricingEngineError as e:
            raise QuoteServiceError(str(e)) from e

        quote_id = None
        status = "calculated"

        if save:
            quote = self.quotes.create_quote(
                insurer_id=product.insurer_id,
                product_id=product_id,
                total_premium=result["final_premium"],
                application_id=application_id,
                customer_id=customer_id,
                status="draft",
            )
            self.quotes.add_quote_items(quote.id, result["breakdown"])
            self.db.commit()
            self.db.refresh(quote)
            quote_id = quote.id
            status = quote.status

        return {
            "quote_id": quote_id,
            "insurer_id": product.insurer_id,
            "product_id": product_id,
            "final_premium": result["final_premium"],
            "status": status,
            "breakdown": result["breakdown"],
        }