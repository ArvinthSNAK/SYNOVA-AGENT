from app.db import SessionLocal, Base, engine
from app.models import Product, PricingRule, AddOn

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    existing = db.query(Product).filter(Product.name == "SecureDrive Motor Plan").first()
    if existing:
        print("Product already seeded, skipping.")
    else:
        product = Product(
            name="SecureDrive Motor Plan",
            insurance_type="motor",
            base_rate_percent=2.5,
            active=True,
        )
        db.add(product)
        db.flush()

        rules = [
            PricingRule(
                product_id=product.id,
                name="Base Premium (2.5% of IDV)",
                rule_type="base",
                expression={"op": "mul", "args": [{"var": "idv"}, {"const": 0.025}]},
                priority=10,
                active=True,
            ),
            PricingRule(
                product_id=product.id,
                name="Vehicle Age Loading (Rs. 1200 per year)",
                rule_type="loading",
                expression={"op": "mul", "args": [{"var": "vehicle_age_years"}, {"const": 1200}]},
                priority=20,
                active=True,
            ),
            # Note: Insurer B deliberately has NO NCB discount rule —
            # this insurer doesn't reward no-claim history the way Insurer A does.
            PricingRule(
                product_id=product.id,
                name="GST @ 18%",
                rule_type="tax",
                expression={
                    "op": "mul",
                    "args": [
                        {"op": "add", "args": [
                            {"op": "mul", "args": [{"var": "idv"}, {"const": 0.025}]},
                            {"op": "mul", "args": [{"var": "vehicle_age_years"}, {"const": 1200}]},
                        ]},
                        {"const": 0.18},
                    ],
                },
                priority=40,
                active=True,
            ),
        ]
        db.add_all(rules)

        addons = [
            AddOn(product_id=product.id, name="Zero Depreciation", premium_flat_amount=2200.0, active=True),
            AddOn(product_id=product.id, name="Roadside Assistance", premium_flat_amount=600.0, active=True),
        ]
        db.add_all(addons)

        db.commit()
        print(f"Seeded product '{product.name}' (id={product.id}) with {len(rules)} pricing rules and {len(addons)} add-ons.")

finally:
    db.close()