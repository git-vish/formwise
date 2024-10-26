from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Configurations for loading environment variables
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # *** Application settings ***
    APP_TITLE: str = "Formwise"
    APP_DESCRIPTION: str = "Formwise Description"
    APP_VERSION: str = "0.1.0"

    # *** MongoDB settings ***
    MONGO_URI: SecretStr
    MONGO_DATABASE: str = "formwise"


# Instantiate settings
settings = Settings()
