from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    INSURER_A_URL: str = "http://localhost:8001"
    INSURER_B_URL: str = "http://localhost:8002"
    INSURER_C_URL: str = "http://localhost:8003"
    INSURER_D_URL: str = "http://localhost:8004"
    PLAYWRIGHT_HEADLESS: bool = False
    SLOW_MO_MS: int = 600
    MAX_CONCURRENT_JOBS: int = 4

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
