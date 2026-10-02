from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    SECRET_KEY: str = "supersecretkeyformultiauthdevelopmentonly1234"
    DATABASE_URL: str = "sqlite:///./pocketsmart.db"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000"
    MAX_UPLOAD_MB: int = 5
    COOKIE_SECURE: bool = False
    RATE_LIMIT_ENABLED: bool = True
    FRONTEND_DIST_DIR: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
