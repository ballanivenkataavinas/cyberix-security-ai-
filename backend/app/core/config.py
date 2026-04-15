"""
Configuration Management
"""
from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # API Configuration
    GROQ_API_KEY: str = ""  # Groq API (free tier available)
    OPENAI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    API_BASE_URL: str = "https://api.openai.com/v1"
    
    # Security
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database - Supports SQLite (local) and PostgreSQL (production)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cyberix.db")
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:8000,http://127.0.0.1:8000"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Environment
    ENVIRONMENT: str = "development"
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Convert ALLOWED_ORIGINS string to list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
