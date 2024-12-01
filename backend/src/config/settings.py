from typing import Literal

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

from src.utils.custom_types import MongoDsn


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

    # *** Form settings ***
    MAX_FORMS: int = 5  # per user
    MAX_FIELDS: int = 50
    MAX_RESPONSES: int = 150  # per form

    # *** LLM settings ***
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.1-70b-versatile"
    GROQ_TEMPERATURE: float = 0.5

    # *** LangSmith settings ***
    LANGCHAIN_API_KEY: str
    LANGCHAIN_ENDPOINT: str
    LANGCHAIN_PROJECT: str
    LANGCHAIN_TRACING_V2: Literal["true", "false"]

    # *** Rate Limit settings ***
    RATE_LIMIT_DELTA: int = 60  # in seconds
    RATE_LIMIT_LIMIT: int = 10

    @property
    def allowed_origins(self) -> list[str]:
        """Returns a list of allowed origins."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


def get_settings() -> Settings:
    """
    Returns an instance of `Settings`.

    Returns:
        Settings: A settings instance.
    """
    load_dotenv()
    return Settings()


settings = get_settings()
