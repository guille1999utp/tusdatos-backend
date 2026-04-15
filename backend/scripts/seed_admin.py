"""
Crea un usuario administrador inicial si no existe.

Uso (desde la carpeta backend):
  python scripts/seed_admin.py

Variables opcionales (o en .env):
  SEED_ADMIN_EMAIL
  SEED_ADMIN_PASSWORD
  SEED_ADMIN_NAME
"""
from __future__ import annotations

import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from dotenv import load_dotenv

load_dotenv(os.path.join(ROOT, ".env"))

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database.main import SessionLocal
from models.user import User
from models.roles import UserRoleEnum

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def main() -> None:
    email = os.environ.get("SEED_ADMIN_EMAIL", "admin@miseventos.com")
    password = os.environ.get("SEED_ADMIN_PASSWORD", "Admin123!")
    name = os.environ.get("SEED_ADMIN_NAME", "Administrador")

    db: Session = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"Ya existe un usuario con email: {email}")
            return
        user = User(
            email=email,
            name=name,
            hashed_password=pwd_context.hash(password),
            role=UserRoleEnum.admin,
        )
        db.add(user)
        db.commit()
        print(f"Administrador creado: {email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
