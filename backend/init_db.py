"""
Initialize database with demo users
"""
import sys
from database import SessionLocal, Base, engine
from models import User
from auth import hash_password
from config import ADMIN_EMAIL, ADMIN_PASSWORD

def init_db():
    """Create tables and seed demo users"""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if demo users already exist
    admin_exists = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    user_exists = db.query(User).filter(User.email == "user@example.com").first()
    
    if not admin_exists:
        print(f"Creating admin user: {ADMIN_EMAIL}")
        admin = User(
            email=ADMIN_EMAIL,
            username="admin",
            password=hash_password(ADMIN_PASSWORD),
            first_name="Admin",
            last_name="User"
        )
        db.add(admin)
        print(f"✓ Admin user created")
    else:
        print(f"✓ Admin user already exists")
    
    if not user_exists:
        print("Creating demo user: user@example.com")
        user = User(
            email="user@example.com",
            username="demouser",
            password=hash_password("user123"),
            first_name="Demo",
            last_name="User"
        )
        db.add(user)
        print("✓ Demo user created")
    else:
        print("✓ Demo user already exists")
    
    try:
        db.commit()
        print("\nDatabase initialization completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error during database initialization: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
