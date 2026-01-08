"""add session_expires_at to otp_codes

Revision ID: 9217c91ec799
Revises: 4dbdc82aaaba
Create Date: 2026-01-08 09:56:01.978591

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9217c91ec799'
down_revision: Union[str, Sequence[str], None] = '4dbdc82aaaba'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "otp_codes",
        sa.Column("session_expires_at", sa.DateTime(), nullable=True)
    )

    op.execute("""
    UPDATE otp_codes
    SET session_expires_at = created_at + INTERVAL '10 minutes'
    WHERE session_expires_at IS NULL
    """)

    op.alter_column(
        "otp_codes",
        "session_expires_at",
        nullable=False
    )



def downgrade() -> None:
    """Downgrade schema."""
    pass
