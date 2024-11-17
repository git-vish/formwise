from pydantic_settings import BaseSettings, SettingsConfigDict

from src.utils.types import MongoDsn


class Settings(BaseSettings):
    # Configurations for loading environment variables
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # *** Application settings ***
    APP_TITLE: str = "Formwise"
    APP_DESCRIPTION: str = "Formwise Description"
    APP_VERSION: str = "0.1.0"
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # *** MongoDB settings ***
    MONGO_URI: MongoDsn
    MONGO_DB_NAME: str = "formwise"

    # *** JWT settings ***
    JWT_SECRET: str = "secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 60  # 1 hour

    # *** Google OAuth settings ***
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    # *** Logfire settings ***
    LOGFIRE_TOKEN: str = ""

    @property
    def allowed_origins(self) -> list[str]:
        """Returns a list of allowed origins."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
