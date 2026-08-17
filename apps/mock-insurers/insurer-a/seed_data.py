from app.db import SessionLocal, Base, engine
from app.models import Product, PricingRule, AddOn

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    existing = db.query(Product).filter(Product.name == "Comprehensive Motor Cover").first()
    if existing:
        print("Product already seeded, skipping.")
    else:
        product = Product(
            name="Comprehensive Motor Cover",
            insurance_type="motor",
            base_rate_percent=3.0,
            active=True,
        )
        db.add(product)
        db.flush()  # get product.id

        rules = [
            PricingRule(
                product_id=product.id,
                name="Base Premium (3% of IDV)",
                rule_type="base",
                expression={"op": "mul", "args": [{"var": "idv"}, {"const": 0.03}]},
                priority=10,
                active=True,
            ),
            PricingRule(
                product_id=product.id,
                name="Vehicle Age Loading (Rs. 500 per year)",
                rule_type="loading",
                expression={"op": "mul", "args": [{"var": "vehicle_age_years"}, {"const": 500}]},
                priority=20,
                active=True,
            ),
            PricingRule(
                product_id=product.id,
                name="NCB Discount",
                rule_type="discount",
                expression={
                    "op": "mul",
                    "args": [
                        {"op": "mul", "args": [{"var": "idv"}, {"const": 0.03}]},
                        {"op": "div", "args": [{"var": "ncb_percent"}, {"const": 100}]},
                    ],
                },
                priority=30,
                active=True,
            ),
            PricingRule(
                product_id=product.id,
                name="GST @ 18%",
                rule_type="tax",
                expression={
                    "op": "mul",
                    "args": [
                        {"op": "add", "args": [
                            {"op": "mul", "args": [{"var": "idv"}, {"const": 0.03}]},
                            {"op": "mul", "args": [{"var": "vehicle_age_years"}, {"const": 500}]},
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
            AddOn(product_id=product.id, name="Zero Depreciation", premium_flat_amount=1500.0, active=True),
            AddOn(product_id=product.id, name="Engine Protection", premium_flat_amount=800.0, active=True),
        ]
        db.add_all(addons)

        db.commit()
        print(f"Seeded product '{product.name}' (id={product.id}) with {len(rules)} pricing rules and {len(addons)} add-ons.")

finally:
    db.close()