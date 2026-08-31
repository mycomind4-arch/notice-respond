from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="PERMIT_SIGNAL_",
        env_file=".env",
        extra="ignore",
    )

    env: str = "development"
    database_path: str = "./data/permit-signal.db"
    request_timeout_seconds: float = Field(default=30, gt=0, le=120)
    user_agent: str = "PermitSignal/0.1"
    max_pages_per_run: int = Field(default=25, ge=1, le=100)
    log_level: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    return Settings()
