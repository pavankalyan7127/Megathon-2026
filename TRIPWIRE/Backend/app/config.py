"""Application configuration."""

from pathlib import Path
from pydantic import ConfigDict
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = BASE_DIR / "tripwire_v2.db"


class Settings(BaseSettings):
    """Application settings."""

    # API configuration
    api_v1_prefix: str = "/api/v1"

    # Application metadata
    app_name: str = "Tripwire"
    app_version: str = "0.1.0"

    # Environment
    environment: str = "development"

    # Database
    database_url: str = f"sqlite:///{DEFAULT_DB_PATH.as_posix()}"

    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=False,
    )


settings = Settings()
