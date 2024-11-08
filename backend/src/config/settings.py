from typing import Annotated

from pydantic import UrlConstraints
from pydantic_core import MultiHostUrl
from pydantic_settings import BaseSettings, SettingsConfigDict

MongoDsn = Annotated[MultiHostUrl, UrlConstraints(allowed_schemes=["mongodb+srv"])]


class Settings(BaseSettings):
    # Configurations for loading environment variables
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # *** Application settings ***
    APP_TITLE: str = "Formwise"
    APP_DESCRIPTION: str = "Formwise Description"
    APP_VERSION: str = "0.1.0"
    APP_ALLOWED_ORIGINS: str = "http://localhost:3000"

    # *** MongoDB settings ***
    MONGO_CONNECTION_STRING: MongoDsn
    MONGO_DATABASE_NAME: str = "formwise"

    # *** JWT settings ***
    JWT_SECRET_KEY: str = "secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXP: int = 60  # 1 hour

    # *** Google OAuth settings ***
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    @property
    def allowed_origins(self) -> list[str]:
        """Returns a list of allowed origins."""
        return [origin.strip() for origin in self.APP_ALLOWED_ORIGINS.split(",")]


settings = Settings()
