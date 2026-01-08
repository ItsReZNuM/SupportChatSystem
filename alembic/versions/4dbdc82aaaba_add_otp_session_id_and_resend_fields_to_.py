"""add otp_session_id and resend fields to otp_codes

Revision ID: 4dbdc82aaaba
Revises: b7c9c25f13e7
Create Date: 2026-01-08 09:05:16.908615

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4dbdc82aaaba'
down_revision: Union[str, Sequence[str], None] = '9036f7f58244'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1. nullable اضافه کن
    op.add_column(
        "otp_codes",
        sa.Column("otp_session_id", sa.String(length=128), nullable=True)
    )

    op.add_column(
        "otp_codes",
        sa.Column("resend_count", sa.Integer(), server_default="0", nullable=False)
    )

    op.add_column(
        "otp_codes",
        sa.Column("last_sent_at", sa.DateTime(), nullable=True)
    )

    # 2. backfill برای داده‌های قبلی
    op.execute("""
    UPDATE otp_codes
    SET otp_session_id = 'LEGACY_' || id::text
    WHERE otp_session_id IS NULL
    """)

    # 3. حالا NOT NULL کن
    op.alter_column(
        "otp_codes",
        "otp_session_id",
        nullable=False
    )

    # 4. index
    op.create_index(
        "ix_otp_codes_otp_session_id",
        "otp_codes",
        ["otp_session_id"],
        unique=True
    )



def downgrade():
    op.drop_index("ix_otp_codes_otp_session_id", table_name="otp_codes")
    op.drop_column("otp_codes", "otp_session_id")
    op.drop_column("otp_codes", "resend_count")
    op.drop_column("otp_codes", "last_sent_at")
