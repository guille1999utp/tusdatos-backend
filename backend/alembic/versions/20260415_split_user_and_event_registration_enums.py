"""split users.role and event_registrations.role into separate PostgreSQL enums

Revision ID: split_ue_roles_01
Revises: a1b2c3d4e5f6
Create Date: 2026-04-15

Reemplaza el enum compartido `roleenum` por:
- `userroleenum` (admin, usuario) en `users.role`
- `eventmemberroleenum` (usuario, asistente) en `event_registrations.role`

Los valores antiguos de inscripción distintos de asistente pasan a usuario.
Los roles globales distintos de admin pasan a usuario.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "split_ue_roles_01"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    if conn.dialect.name != "postgresql":
        return

    op.execute(sa.text("CREATE TYPE userroleenum AS ENUM ('admin', 'usuario')"))
    op.execute(sa.text("CREATE TYPE eventmemberroleenum AS ENUM ('usuario', 'asistente')"))

    op.execute(sa.text("ALTER TABLE users ADD COLUMN role_new userroleenum"))
    op.execute(
        sa.text(
            """
            UPDATE users SET role_new = (
                CASE
                    WHEN role IS NOT NULL AND role::text = 'admin' THEN 'admin'::userroleenum
                    ELSE 'usuario'::userroleenum
                END
            )
            """
        )
    )
    op.execute(sa.text("ALTER TABLE users DROP COLUMN role"))
    op.execute(sa.text("ALTER TABLE users RENAME COLUMN role_new TO role"))
    op.execute(sa.text("ALTER TABLE users ALTER COLUMN role SET NOT NULL"))
    op.execute(sa.text("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'usuario'::userroleenum"))

    op.execute(sa.text("ALTER TABLE event_registrations ADD COLUMN role_new eventmemberroleenum"))
    op.execute(
        sa.text(
            """
            UPDATE event_registrations SET role_new = (
                CASE
                    WHEN role IS NOT NULL AND role::text = 'asistente' THEN 'asistente'::eventmemberroleenum
                    ELSE 'usuario'::eventmemberroleenum
                END
            )
            """
        )
    )
    op.execute(sa.text("ALTER TABLE event_registrations DROP COLUMN role"))
    op.execute(sa.text("ALTER TABLE event_registrations RENAME COLUMN role_new TO role"))
    op.execute(sa.text("ALTER TABLE event_registrations ALTER COLUMN role SET NOT NULL"))
    op.execute(
        sa.text(
            "ALTER TABLE event_registrations ALTER COLUMN role SET DEFAULT 'usuario'::eventmemberroleenum"
        )
    )

    op.execute(sa.text("DROP TYPE roleenum"))


def downgrade() -> None:
    conn = op.get_bind()
    if conn.dialect.name != "postgresql":
        return

    op.execute(
        sa.text(
            "CREATE TYPE roleenum AS ENUM ('admin', 'organizador', 'asistente', 'invitado', 'usuario')"
        )
    )

    op.execute(sa.text("ALTER TABLE users ADD COLUMN role_old roleenum"))
    op.execute(
        sa.text(
            """
            UPDATE users SET role_old = (
                CASE
                    WHEN role::text = 'admin' THEN 'admin'::roleenum
                    ELSE 'usuario'::roleenum
                END
            )
            """
        )
    )
    op.execute(sa.text("ALTER TABLE users DROP COLUMN role"))
    op.execute(sa.text("ALTER TABLE users RENAME COLUMN role_old TO role"))

    op.execute(sa.text("ALTER TABLE event_registrations ADD COLUMN role_old roleenum"))
    op.execute(
        sa.text(
            """
            UPDATE event_registrations SET role_old = (
                CASE
                    WHEN role::text = 'asistente' THEN 'asistente'::roleenum
                    ELSE 'usuario'::roleenum
                END
            )
            """
        )
    )
    op.execute(sa.text("ALTER TABLE event_registrations DROP COLUMN role"))
    op.execute(sa.text("ALTER TABLE event_registrations RENAME COLUMN role_old TO role"))

    op.execute(sa.text("DROP TYPE userroleenum"))
    op.execute(sa.text("DROP TYPE eventmemberroleenum"))
