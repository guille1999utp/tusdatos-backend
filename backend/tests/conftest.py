import os
from collections.abc import Generator

# Settings se carga al importar `main`; en CI/tests debe existir SECRET_KEY.
os.environ.setdefault(
    "SECRET_KEY",
    "pytest-only-secret-key-do-not-use-in-production-32chars",
)

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from database.main import Base, get_db
from main import app


SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_database() -> Generator[None, None, None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def auth_headers(client: TestClient, email: str, password: str, name: str = "Usuario") -> dict[str, str]:
    register_resp = client.post(
        "/auth/register",
        json={"email": email, "password": password, "name": name, "role": "admin"},
    )
    token = register_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
