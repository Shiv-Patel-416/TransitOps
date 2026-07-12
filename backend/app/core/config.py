from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = "transitops-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    DATABASE_URL: str = "sqlite:///./transitops.db"

    class Config:
        env_file = ".env"


settings = Settings()
