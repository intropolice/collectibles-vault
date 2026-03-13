import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://collectibles_user:collectibles_pass@localhost:5432/collectibles_vault"
)

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080  # 7 days

# Application Configuration
DEBUG = os.getenv("DEBUG", "False") == "True"
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@collectibles.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

# File Upload Configuration
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
