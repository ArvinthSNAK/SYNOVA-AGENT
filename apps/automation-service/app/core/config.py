from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    INSURER_A_URL: str = "http://localhost:9001"
    INSURER_B_URL: str = "http://localhost:9002"
    INSURER_C_URL: str = "http://localhost:9003"
    INSURER_D_URL: str = "http://localhost:9004"
    PLAYWRIGHT_HEADLESS: bool = True
    MAX_CONCURRENT_JOBS: int = 4

    class Config:
        env_file = ".env"


settings = Settings()
