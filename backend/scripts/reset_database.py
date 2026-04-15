"""
Borra todas las tablas del metadata SQLAlchemy y vuelve a aplicar migraciones Alembic desde cero.

ADVERTENCIA: elimina todos los datos de la base configurada en SQLALCHEMY_DATABASE_URL.

Uso (PowerShell, desde la carpeta backend):
  $env:CONFIRM_RESET_DB = "1"
  python scripts/reset_database.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from alembic import command
from alembic.config import Config
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv(ROOT / ".env")

from database.main import Base, engine  # noqa: E402

# Registrar modelos en Base.metadata; sin esto drop_all() no borra ninguna tabla.
import models  # noqa: E402, F401


def _drop_postgresql_orphan_enums() -> None:
    """En PostgreSQL, DROP TABLE no borra los ENUM; si quedan, la migración inicial falla al CREATE TYPE."""
    if engine.dialect.name != "postgresql":
        return
    # Elimina todos los tipos enum del esquema public (típico tras drop_all).
    sql = text(
        """
        DO $$
        DECLARE r RECORD;
        BEGIN
          FOR r IN (
            SELECT t.typname AS name
            FROM pg_type t
            JOIN pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = 'public' AND t.typtype = 'e'
          ) LOOP
            EXECUTE format('DROP TYPE IF EXISTS public.%I CASCADE', r.name);
          END LOOP;
        END $$;
        """
    )
    with engine.begin() as conn:
        conn.execute(sql)
    print("Tipos ENUM huérfanos eliminados (PostgreSQL).")


def main() -> None:
    if os.environ.get("CONFIRM_RESET_DB") != "1":
        print("Define la variable de entorno CONFIRM_RESET_DB=1 para confirmar el borrado total.")
        sys.exit(1)

    print("Eliminando tablas y versión de Alembic…")
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE"))
    Base.metadata.drop_all(bind=engine)
    _drop_postgresql_orphan_enums()

    ini = ROOT / "alembic.ini"
    if not ini.is_file():
        print("No se encontró alembic.ini en", ini)
        sys.exit(1)

    cfg = Config(str(ini))
    print("Aplicando migraciones hasta head…")
    command.upgrade(cfg, "head")
    print("Listo. Puedes ejecutar python scripts/seed_admin.py si necesitas un admin inicial.")


if __name__ == "__main__":
    main()
