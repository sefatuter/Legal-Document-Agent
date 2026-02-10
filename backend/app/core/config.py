from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Legal Document Agent"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    CHROMA_DB_PATH: str = "./chroma_db"
    GEMINI_API_KEY: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
