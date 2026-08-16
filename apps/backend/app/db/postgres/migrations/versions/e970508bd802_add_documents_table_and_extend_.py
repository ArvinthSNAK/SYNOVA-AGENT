"""add documents table and extend extracted_policy_data

Revision ID: e970508bd802
Revises: dbc20b223a3c
Create Date: 2026-08-13 16:44:32.910286

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e970508bd802'
down_revision = 'dbc20b223a3c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table('extracted_policy_data') as batch_op:
        batch_op.create_foreign_key(
            'fk_extracted_policy_data_document_id',
            'documents',
            ['document_id'],
            ['id'],
        )


def downgrade() -> None:
    with op.batch_alter_table('extracted_policy_data') as batch_op:
        batch_op.drop_constraint('fk_extracted_policy_data_document_id', type_='foreignkey')