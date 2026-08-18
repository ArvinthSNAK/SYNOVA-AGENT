"""
Seed script for the main backend database.
Populates insurers, products, pricing rules, and pricing factors
so the internal quote engine and admin panel work out of the box.

Run: python -m seed_data  (from apps/backend/)
"""
from app.db.postgres.session import SessionLocal, engine
from app.db.postgres.base import Base
from app.models.insurer_model import Insurer
from app.models.insurance_product_model import InsuranceProduct
from app.models.pricing_rule_model import PricingRule
from app.models.pricing_factor_model import PricingFactor
from app.models.add_on_model import AddOn
from app.models.user_model import User
from app.models.policy_model import Policy
from app.models.application_model import Application
from app.models.notification_model import Notification

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    existing = db.query(Insurer).first()
    if existing:
        print("Database already seeded, skipping.")
    else:
        # --- Insurers ---
        insurers = [
            Insurer(name="Mock Insurer A", code="insurer_a", description="Comprehensive motor specialist", active=True),
            Insurer(name="Mock Insurer B", code="insurer_b", description="Budget motor insurance", active=True),
            Insurer(name="TrustShield Insurance", code="insurer_c", description="Premium coverage with generous NCB", active=True),
            Insurer(name="SafeGuard Motors", code="insurer_d", description="Engine-focused motor insurance", active=True),
        ]
        db.add_all(insurers)
        db.flush()

        insurer_map = {i.code: i.id for i in insurers}

        # --- Products ---
        products = [
            InsuranceProduct(
                insurer_id=insurer_map["insurer_a"],
                name="Comprehensive Motor Cover",
                insurance_type="motor",
                description="Full coverage with NCB discount",
                base_rate=3.0,
                minimum_premium=5000,
                maximum_premium=200000,
                active=True,
            ),
            InsuranceProduct(
                insurer_id=insurer_map["insurer_b"],
                name="SecureDrive Motor Plan",
                insurance_type="motor",
                description="Budget motor plan, no NCB",
                base_rate=2.5,
                minimum_premium=4000,
                maximum_premium=150000,
                active=True,
            ),
            InsuranceProduct(
                insurer_id=insurer_map["insurer_c"],
                name="TrustShield Comprehensive",
                insurance_type="motor",
                description="Premium plan with TP and generous NCB",
                base_rate=3.5,
                minimum_premium=6000,
                maximum_premium=250000,
                active=True,
            ),
            InsuranceProduct(
                insurer_id=insurer_map["insurer_d"],
                name="SafeGuard Premium Motor",
                insurance_type="motor",
                description="Engine-capacity based pricing with anti-theft discount",
                base_rate=2.8,
                minimum_premium=4500,
                maximum_premium=180000,
                active=True,
            ),
        ]
        db.add_all(products)
        db.flush()

        # --- Pricing Rules for Product A ---
        pa = products[0]
        rules_a = [
            PricingRule(product_id=pa.id, name="Base OD Premium (3% of IDV)", rule_type="base",
                        expression={"op": "mul", "args": [{"var": "vehicle.idv"}, {"const": 0.03}]},
                        priority=10, active=True),
            PricingRule(product_id=pa.id, name="Vehicle Age Loading", rule_type="loading",
                        expression={"op": "mul", "args": [{"var": "vehicle.age_years"}, {"const": 500}]},
                        priority=20, active=True),
            PricingRule(product_id=pa.id, name="NCB Discount", rule_type="discount",
                        expression={"op": "mul", "args": [
                            {"op": "mul", "args": [{"var": "vehicle.idv"}, {"const": 0.03}]},
                            {"op": "div", "args": [{"var": "driver.ncb_percent"}, {"const": 100}]},
                        ]},
                        priority=30, active=True),
            PricingRule(product_id=pa.id, name="GST @ 18%", rule_type="tax",
                        expression={"op": "mul", "args": [
                            {"op": "add", "args": [
                                {"op": "mul", "args": [{"var": "vehicle.idv"}, {"const": 0.03}]},
                                {"op": "mul", "args": [{"var": "vehicle.age_years"}, {"const": 500}]},
                            ]},
                            {"const": 0.18},
                        ]},
                        priority=40, active=True),
        ]
        db.add_all(rules_a)

        # --- Pricing Factors (global) ---
        factors = [
            PricingFactor(code="gst_rate", name="GST Rate", value=18.0, active=True),
            PricingFactor(code="tp_base_car", name="Third Party Base (Car)", value=2500.0, active=True),
            PricingFactor(code="tp_base_bike", name="Third Party Base (Bike)", value=1200.0, active=True),
            PricingFactor(code="ncb_max_percent", name="Maximum NCB Percent", value=50.0, active=True),
        ]
        db.add_all(factors)

        # --- Add-ons for Product A ---
        addons_a = [
            AddOn(product_id=pa.id, name="Zero Depreciation", description="Full claim without depreciation", premium_calculation_method="flat", flat_amount=1500.0, active=True),
            AddOn(product_id=pa.id, name="Engine Protection", description="Covers engine damage from waterlogging", premium_calculation_method="flat", flat_amount=800.0, active=True),
            AddOn(product_id=pa.id, name="Roadside Assistance", description="24/7 breakdown support", premium_calculation_method="flat", flat_amount=500.0, active=True),
        ]
        db.add_all(addons_a)

        # --- Demo User ---
        demo_user = User(
            email="demo@example.com",
            full_name="Demo Customer",
            hashed_password="demo123",
            is_active=True,
            role="customer",
        )
        db.add(demo_user)

        db.commit()
        print(f"Seeded {len(insurers)} insurers, {len(products)} products, {len(rules_a)} pricing rules, {len(factors)} factors, {len(addons_a)} add-ons, 1 demo user.")

finally:
    db.close()
