from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Mis Eventos API"
    environment: str = "development"
    sqlalchemy_database_url: str = "postgresql://postgres:postgres@localhost:5432/miseventos"
    secret_key: str = "change-me-in-env"
    access_token_expire_minutes: int = 60


settings = Settings()