from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Mis Eventos API"
    environment: str = "development"
    # Render (y otros PaaS) suelen inyectar DATABASE_URL al vincular Postgres.
    sqlalchemy_database_url: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/miseventos",
        validation_alias=AliasChoices(
            "SQLALCHEMY_DATABASE_URL",
            "DATABASE_URL",
        ),
    )
    # Firma de JWT: definir SECRET_KEY en el entorno (nunca un valor fijo en código).
    secret_key: str = Field(
        ...,
        min_length=32,
        description="SECRET_KEY: cadena aleatoria larga (p. ej. openssl rand -hex 32).",
    )
    access_token_expire_minutes: int = 60


settings = Settings()