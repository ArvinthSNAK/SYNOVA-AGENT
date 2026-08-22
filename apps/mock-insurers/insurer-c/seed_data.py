from app.db import SessionLocal, Base, engine
from app.models import Product, PricingRule, AddOn

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    existing = db.query(Product).filter(Product.name == "TrustShield Comprehensive").first()
    if existing:
        print("Product already seeded, skipping.")
    else:
        product = Product(
            name="TrustShield Comprehensive",
            insurance_type="motor",
            base_rate_percent=3.5,
            active=True,
        )
        db.add(product)
        db.flush()

        rules = [
            PricingRule(
                product_id=product.id,
                name="Base OD Premium (3.5% of IDV)",
                rule_type="base",
                expression={"op": "mul", "args": [{"var": "idv"}, {"const": 0.035}]},
                priority=10,
                active=True,
            ),
            PricingRule(
                product_id=product.id,
                name="Third Party Premium (flat ₹2500)",
                rule_type="loading",
                expression={"const": 2500},
                priority=15,
                active=True,
            ),
            PricingRule(
                product_id=product.id,
                name="Vehicle Age Loading (₹300 per year)",
                rule_type="loading",
                expression={"op": "mul", "args": [{"var": "vehicle_age_years"}, {"const": 300}]},
                priority=20,
                active=True,
            ),
            PricingRule(
                product_id=product.id,
                name="NCB Discount (generous: applied on base+TP)",
                rule_type="discount",
                expression={
                    "op": "mul",
                    "args": [
                        {"op": "add", "args": [
                            {"op": "mul", "args": [{"var": "idv"}, {"const": 0.035}]},
                            {"const": 2500},
                        ]},
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
                            {"op": "mul", "args": [{"var": "idv"}, {"const": 0.035}]},
                            {"const": 2500},
                            {"op": "mul", "args": [{"var": "vehicle_age_years"}, {"const": 300}]},
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
            AddOn(product_id=product.id, name="Zero Depreciation", premium_flat_amount=1800.0, active=True),
            AddOn(product_id=product.id, name="Engine Protection", premium_flat_amount=950.0, active=True),
            AddOn(product_id=product.id, name="Roadside Assistance", premium_flat_amount=450.0, active=True),
            AddOn(product_id=product.id, name="Return to Invoice", premium_flat_amount=700.0, active=True),
        ]
        db.add_all(addons)

        db.commit()
        print(f"Seeded product '{product.name}' (id={product.id}) with {len(rules)} pricing rules and {len(addons)} add-ons.")

finally:
    db.close()
