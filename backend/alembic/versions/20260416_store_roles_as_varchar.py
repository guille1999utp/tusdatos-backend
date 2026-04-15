"""Guardar roles globales y por evento como VARCHAR (alineado con TypeDecorator en modelos).

Revision ID: roles_text_02
Revises: split_ue_roles_01
Create Date: 2026-04-16

Evita desajustes entre enums nativos de PostgreSQL y los valores legados (p. ej. asistente en users).
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "roles_text_02"
down_revision: Union[str, None] = "split_ue_roles_01"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    if conn.dialect.name != "postgresql":
        return

    op.execute(sa.text("ALTER TABLE users ALTER COLUMN role DROP DEFAULT"))
    op.execute(sa.text("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(32) USING role::text"))
    op.execute(sa.text("UPDATE users SET role = 'usuario' WHERE role IS NULL OR role <> 'admin'"))
    op.execute(sa.text("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'usuario'"))
    op.execute(sa.text("ALTER TABLE users ALTER COLUMN role SET NOT NULL"))

    op.execute(sa.text("ALTER TABLE event_registrations ALTER COLUMN role DROP DEFAULT"))
    op.execute(sa.text("ALTER TABLE event_registrations ALTER COLUMN role TYPE VARCHAR(32) USING role::text"))
    op.execute(
        sa.text(
            "UPDATE event_registrations SET role = 'usuario' WHERE role IS NULL OR role <> 'asistente'"
        )
    )
    op.execute(sa.text("ALTER TABLE event_registrations ALTER COLUMN role SET DEFAULT 'usuario'"))
    op.execute(sa.text("ALTER TABLE event_registrations ALTER COLUMN role SET NOT NULL"))

    op.execute(sa.text("DROP TYPE IF EXISTS userroleenum CASCADE"))
    op.execute(sa.text("DROP TYPE IF EXISTS eventmemberroleenum CASCADE"))


def downgrade() -> None:
    raise NotImplementedError("Volver a enums nativos no está soportado; restaura desde backup.")
