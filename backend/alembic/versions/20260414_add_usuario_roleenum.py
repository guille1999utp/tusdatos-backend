"""add usuario to roleenum and migrate invitado

Revision ID: a1b2c3d4e5f6
Revises: 005f29e55a36
Create Date: 2026-04-14

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "005f29e55a36"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # PostgreSQL requires committing enum value additions before usage.
    with op.get_context().autocommit_block():
        op.execute(
            sa.text(
                """
                DO $$ BEGIN
                    ALTER TYPE roleenum ADD VALUE 'usuario';
                EXCEPTION
                    WHEN duplicate_object THEN NULL;
                END $$;
                """
            )
        )
    op.execute(
        sa.text(
            "UPDATE users SET role = CAST('usuario' AS roleenum) WHERE role::text = 'invitado'"
        )
    )
    op.execute(
        sa.text(
            "UPDATE event_registrations SET role = CAST('usuario' AS roleenum) WHERE role::text = 'invitado'"
        )
    )


def downgrade() -> None:
    op.execute(
        sa.text(
            "UPDATE users SET role = CAST('asistente' AS roleenum) WHERE role::text = 'usuario'"
        )
    )
    op.execute(
        sa.text(
            "UPDATE event_registrations SET role = CAST('asistente' AS roleenum) WHERE role::text = 'usuario'"
        )
    )
