from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./dev.db"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    AUTOMATION_SERVICE_URL: str = "http://localhost:8001"

    # Email Settings
    EMAIL_PROVIDER: str = "mock"  # "smtp", "sendgrid", "mock"
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "notifications@synovainsurance.com"
    SMTP_USE_TLS: bool = True
    
    SENDGRID_API_KEY: str = ""
    SENDGRID_FROM_EMAIL: str = "notifications@synovainsurance.com"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
