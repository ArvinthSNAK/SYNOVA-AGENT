"""
One-time dev script: creates all tables from SQLAlchemy models.
Run this whenever the dev.db file is missing tables.
NOT a replacement for Alembic long-term — just an unblock for now.
"""
from app.db.postgres.base import Base
from app.db.postgres.session import engine

# Import every model so their tables register on Base.metadata
from app.models import (
    insurer_model,
    insurance_product_model,
    coverage_type_model,
    product_coverage_model,
    add_on_model,
    pricing_rule_model,
    pricing_factor_model,
    quote_model,
    quote_item_model,
    extracted_policy_data_model,
    policy_version_model,
    notification_model,
)

Base.metadata.create_all(bind=engine)
print("All tables created successfully.")