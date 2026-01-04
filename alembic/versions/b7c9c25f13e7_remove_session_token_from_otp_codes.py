"""remove session_token from otp_codes

Revision ID: b7c9c25f13e7
Revises: add_otp_session_token
Create Date: 2026-01-04 13:32:42.568951

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7c9c25f13e7'
down_revision: Union[str, Sequence[str], None] = 'add_otp_session_token'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    op.drop_column("otp_codes", "session_token")


def downgrade():
    op.add_column(
        "otp_codes",
        sa.Column("session_token", sa.String(length=64), nullable=False)
    )
