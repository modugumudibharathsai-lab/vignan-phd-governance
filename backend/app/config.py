import os

class Settings:
    PROJECT_NAME: str = "Vignan University Multi-Agent Administration Platform"
    API_V1_STR: str = "/api"
    # Supports PostgreSQL or defaults to local SQLite for instant execution
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./uni_platform.db"
    )
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    CORS_ORIGINS: list[str] = ["*"]
    
    # Institution configuration
    INSTITUTION_NAME: str = "Vignan's Foundation for Science, Technology & Research (Deemed to be University)"
    INSTITUTION_SHORT: str = "VFSTR / Vignan University"
    ACADEMIC_YEAR: str = "2024-25"

settings = Settings()
