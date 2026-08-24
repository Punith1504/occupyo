"""Initial schema and HNSW index

Revision ID: 001
Revises: 
Create Date: 2026-08-25 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import pgvector.sqlalchemy


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create vector extension if it does not already exist
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # 2. Create tables
    op.create_table('brokers',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('first_name', sa.String(), nullable=False),
        sa.Column('last_name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True, default=False),
        sa.Column('license_number', sa.String(), nullable=True),
        sa.Column('performance_score', sa.Float(), nullable=True, default=1.0),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_brokers_email'), 'brokers', ['email'], unique=True)

    op.create_table('demand_leads',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('source', sa.String(), nullable=True),
        sa.Column('raw_content', sa.String(), nullable=True),
        sa.Column('property_type', sa.String(), nullable=True),
        sa.Column('target_city', sa.String(), nullable=True),
        sa.Column('target_sub_market', sa.String(), nullable=True),
        sa.Column('min_square_footage', sa.Integer(), nullable=True),
        sa.Column('max_square_footage', sa.Integer(), nullable=True),
        sa.Column('target_budget_sf', sa.Float(), nullable=True),
        sa.Column('intent_score', sa.Float(), nullable=True, default=0.0),
        sa.Column('status', sa.String(), nullable=True, default='New'),
        sa.Column('embedding', pgvector.sqlalchemy.Vector(dim=1536), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_demand_leads_target_city'), 'demand_leads', ['target_city'], unique=False)

    op.create_table('listings',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('broker_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('property_type', sa.String(), nullable=False),
        sa.Column('sub_market', sa.String(), nullable=False),
        sa.Column('city', sa.String(), nullable=False),
        sa.Column('state', sa.String(), nullable=False),
        sa.Column('lat', sa.Float(), nullable=True),
        sa.Column('lng', sa.Float(), nullable=True),
        sa.Column('square_footage', sa.Integer(), nullable=False),
        sa.Column('ceiling_height_ft', sa.Float(), nullable=True),
        sa.Column('price_per_sf', sa.Float(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.Column('embedding', pgvector.sqlalchemy.Vector(dim=1536), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['broker_id'], ['brokers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_listings_city'), 'listings', ['city'], unique=False)
    op.create_index(op.f('ix_listings_id'), 'listings', ['id'], unique=False)
    op.create_index(op.f('ix_listings_sub_market'), 'listings', ['sub_market'], unique=False)

    op.create_table('audit_ledger',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('entity_type', sa.String(), nullable=False),
        sa.Column('entity_id', sa.String(), nullable=False),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('hash_receipt', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('match_events',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('lead_id', sa.String(), nullable=True),
        sa.Column('listing_id', sa.Integer(), nullable=True),
        sa.Column('broker_id', sa.String(), nullable=True),
        sa.Column('match_score', sa.Float(), nullable=False),
        sa.Column('notified_at', sa.DateTime(), nullable=True),
        sa.Column('claimed', sa.Boolean(), nullable=True, default=False),
        sa.ForeignKeyConstraint(['broker_id'], ['brokers.id'], ),
        sa.ForeignKeyConstraint(['lead_id'], ['demand_leads.id'], ),
        sa.ForeignKeyConstraint(['listing_id'], ['listings.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # 3. HNSW Index Optimization on listings.embedding
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_listings_embedding_hnsw 
        ON listings 
        USING hnsw (embedding vector_cosine_ops) 
        WITH (m = 16, ef_construction = 64);
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_listings_embedding_hnsw;")
    op.drop_table('match_events')
    op.drop_table('audit_ledger')
    op.drop_index(op.f('ix_listings_sub_market'), table_name='listings')
    op.drop_index(op.f('ix_listings_id'), table_name='listings')
    op.drop_index(op.f('ix_listings_city'), table_name='listings')
    op.drop_table('listings')
    op.drop_index(op.f('ix_demand_leads_target_city'), table_name='demand_leads')
    op.drop_table('demand_leads')
    op.drop_index(op.f('ix_brokers_email'), table_name='brokers')
    op.drop_table('brokers')
    op.execute("DROP EXTENSION IF EXISTS vector;")
