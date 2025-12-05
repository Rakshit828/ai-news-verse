from pydantic_settings import BaseSettings, SettingsConfigDict

class Config(BaseSettings):
    DATABASE_URL: str
    IS_DEV: bool
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    REFRESH_TOKEN_EXPIRY_DAYS: int
    ACCESS_TOKEN_EXPIRY_MINUTES: int

    GROQ_API_KEY: str

    ANTHROPIC_RSS_URLS: str
    OPENAI_RSS_URLS: str
    HACKERNOON_RSS_URL: str

    model_config = SettingsConfigDict(
        env_file='.env.dev',
        extra='ignore'
    )

CONFIG = Config()