from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    app_env: str = "development"
    backend_api_url: str = "http://localhost:8000"
    openai_api_key: str = ""
    openai_realtime_model: str = "gpt-realtime"
    openai_text_model: str = "gpt-4o-mini"
    livekit_url: str = ""
    livekit_api_key: str = ""
    livekit_api_secret: str = ""
    allowed_origins: str = "http://localhost:5173"

    @property
    def origins(self) -> list[str]: return [x.strip() for x in self.allowed_origins.split(",") if x.strip()]

@lru_cache
def settings() -> Settings: return Settings()
