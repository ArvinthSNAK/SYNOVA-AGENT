"""initial schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-08-13

"""
from alembic import op
import sqlalchemy as sa

revision = '0001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'insurers',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(255), nullable=False, unique=True),
        sa.Column('description', sa.Text),
        sa.Column('active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )

    op.create_table(
        'insurance_products',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('insurer_id', sa.Integer, sa.ForeignKey('insurers.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('insurance_type', sa.String(50), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('base_rate', sa.Float),
        sa.Column('minimum_premium', sa.Float),
        sa.Column('maximum_premium', sa.Float),
        sa.Column('active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )

    op.create_table(
        'coverage_types',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('code', sa.String(100), nullable=False, unique=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )

    op.create_table(
        'product_coverages',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('product_id', sa.Integer, sa.ForeignKey('insurance_products.id'), nullable=False),
        sa.Column('coverage_type_id', sa.Integer, sa.ForeignKey('coverage_types.id'), nullable=False),
        sa.Column('limit', sa.Float),
        sa.Column('exclusion', sa.Text),
        sa.Column('active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )

    op.create_table(
        'add_ons',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('product_id', sa.Integer, sa.ForeignKey('insurance_products.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('premium_factor', sa.Float),
        sa.Column('eligibility', sa.Text),
        sa.Column('coverage_limit', sa.Float),
        sa.Column('exclusions', sa.Text),
        sa.Column('active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )

    op.create_table(
        'pricing_factors',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('code', sa.String(100), nullable=False, unique=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('factor_type', sa.String(50)),
        sa.Column('value', sa.Float),
        sa.Column('active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )

    op.create_table(
        'pricing_rules',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('product_id', sa.Integer, sa.ForeignKey('insurance_products.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('rule_type', sa.String(50)),
        sa.Column('expression', sa.JSON),
        sa.Column('priority', sa.Integer, nullable=False, server_default='100'),
        sa.Column('active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )

    op.create_table(
        'quotes',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('application_id', sa.Integer),
        sa.Column('customer_id', sa.Integer),
        sa.Column('insurer_id', sa.Integer, sa.ForeignKey('insurers.id'), nullable=False),
        sa.Column('product_id', sa.Integer, sa.ForeignKey('insurance_products.id'), nullable=False),
        sa.Column('total_premium', sa.Float, nullable=False),
        sa.Column('idv', sa.Float),
        sa.Column('deductible', sa.Float),
        sa.Column('metadata', sa.JSON),
        sa.Column('status', sa.String(50), nullable=False, server_default='draft'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )

    op.create_table(
        'quote_items',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('quote_id', sa.Integer, sa.ForeignKey('quotes.id'), nullable=False),
        sa.Column('code', sa.String(100), nullable=False),
        sa.Column('description', sa.String(255)),
        sa.Column('amount', sa.Float, nullable=False),
        sa.Column('meta', sa.JSON),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )

    op.create_table(
        'policy_versions',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('policy_id', sa.Integer, nullable=False),
        sa.Column('version', sa.Integer, nullable=False),
        sa.Column('data', sa.JSON),
        sa.Column('effective_from', sa.DateTime),
        sa.Column('effective_to', sa.DateTime),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )

    op.create_table(
        'extracted_policy_data',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('document_id', sa.Integer, nullable=False),
        sa.Column('customer_name', sa.String(255)),
        sa.Column('policy_number', sa.String(255)),
        sa.Column('insurer_name', sa.String(255)),
        sa.Column('policy_type', sa.String(100)),
        sa.Column('vehicle_registration', sa.String(50)),
        sa.Column('idv', sa.Float),
        sa.Column('start_date', sa.DateTime),
        sa.Column('end_date', sa.DateTime),
        sa.Column('premium', sa.Float),
        sa.Column('ncb', sa.String(50)),
        sa.Column('raw', sa.JSON),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )

    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('customer_id', sa.Integer),
        sa.Column('notification_type', sa.String(100)),
        sa.Column('subject', sa.String(255)),
        sa.Column('message', sa.Text),
        sa.Column('metadata', sa.JSON),
        sa.Column('status', sa.String(50), nullable=False, server_default='pending'),
        sa.Column('sent_at', sa.DateTime),
        sa.Column('active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )


def downgrade():
    op.drop_table('notifications')
    op.drop_table('extracted_policy_data')
    op.drop_table('policy_versions')
    op.drop_table('quote_items')
    op.drop_table('quotes')
    op.drop_table('pricing_rules')
    op.drop_table('pricing_factors')
    op.drop_table('add_ons')
    op.drop_table('product_coverages')
    op.drop_table('coverage_types')
    op.drop_table('insurance_products')
    op.drop_table('insurers')
