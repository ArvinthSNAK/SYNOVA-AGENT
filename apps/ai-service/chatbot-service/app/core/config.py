"""
app/core/config.py

Single source of truth for all environment/config values.
Everything is loaded once from .env at startup via pydantic BaseSettings,
so no other file ever calls os.getenv() directly.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ---- App meta ----
    APP_NAME: str = "Chatbot Service"
    APP_VERSION: str = "1.0.0"
    ENV: str = "development"

    # ---- OpenAI ----
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_TEMPERATURE: float = 0.7
    OPENAI_MAX_TOKENS: int = 500

    # ---- Inbound API authentication ----
    # Comma separated list of valid client API keys, e.g. "key1,key2"
    API_KEYS: str

    # ---- CORS ----
    ALLOWED_ORIGINS: str = "*"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def api_keys_list(self) -> List[str]:
        return [k.strip() for k in self.API_KEYS.split(",") if k.strip()]

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    # lru_cache -> .env is parsed only once, then reused (cheap + consistent)
    return Settings()
