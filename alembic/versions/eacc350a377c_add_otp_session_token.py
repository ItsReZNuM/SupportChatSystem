from alembic import op
import sqlalchemy as sa


revision = "add_otp_session_token"
down_revision = "9036f7f58244"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "otp_codes",
        sa.Column("session_token", sa.String(length=64), nullable=False),
    )
    op.create_index(
        "ix_otp_codes_session_token",
        "otp_codes",
        ["session_token"],
        unique=True,
    )


def downgrade():
    op.drop_index("ix_otp_codes_session_token", table_name="otp_codes")
    op.drop_column("otp_codes", "session_token")
