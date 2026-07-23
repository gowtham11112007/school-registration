import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Configuration class for environment variables."""
    
    # MongoDB Configuration
    MONGO_URI = os.getenv('MONGO_URI')
    DB_NAME = 'school_registration'
    COLLECTION_NAME = 'students'
    
    # SMTP Configuration
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
    SMTP_EMAIL = os.getenv('SMTP_EMAIL')
    SMTP_APP_PASSWORD = os.getenv('SMTP_APP_PASSWORD')
    ADMIN_EMAIL = os.getenv('ADMIN_EMAIL')
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
