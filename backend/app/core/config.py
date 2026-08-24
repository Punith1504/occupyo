from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    ENVIRONMENT: str = "local"
    
    # Database
    DATABASE_URL: str = "postgresql://occupyo:occupyopass@localhost:5432/occupyo_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # AWS configuration
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: Optional[str] = None
    
    # OpenAI (for LLM and Embeddings)
    OPENAI_API_KEY: Optional[str] = None
    
    # Twilio (Voice & SMS/WhatsApp)
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    TWILIO_WHATSAPP_NUMBER: Optional[str] = None
    
    # WhatsApp Business API (alternative to Twilio WhatsApp)
    WHATSAPP_API_TOKEN: Optional[str] = None
    WHATSAPP_PHONE_ID: Optional[str] = None
    
    # SendGrid (Email)
    SENDGRID_API_KEY: Optional[str] = None
    FROM_EMAIL: str = "alerts@occupyo.com"
    
    # Webhook Secrets
    CLERK_WEBHOOK_SECRET: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
