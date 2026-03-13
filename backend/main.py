from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from database import Base, engine, SessionLocal
from routers import auth, collections, items, folders, wishlists, tags, admin, export, comments, categories
from config import DEBUG, ADMIN_EMAIL, ADMIN_PASSWORD
from models import User
from auth import hash_password

# Create tables
Base.metadata.create_all(bind=engine)

# Seed demo users
def seed_demo_users():
    """Create demo users if they don't exist"""
    db = SessionLocal()
    try:
        # Import UserRole here to avoid circular dependency
        from models import UserRole
        
        # Check if demo users exist
        admin_exists = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        user_exists = db.query(User).filter(User.email == "user@example.com").first()
        
        if not admin_exists:
            print(f"[SEED] Creating admin user: {ADMIN_EMAIL}")
            admin = User(
                email=ADMIN_EMAIL,
                username="admin",
                password=hash_password(ADMIN_PASSWORD),
                first_name="Admin",
                last_name="User",
                role=UserRole.ADMIN
            )
            db.add(admin)
            db.commit()
            print("[SEED] ✓ Admin user created with role: admin")
        else:
            print(f"[SEED] Admin user already exists")
        
        if not user_exists:
            print("[SEED] Creating demo user: user@example.com")
            user = User(
                email="user@example.com",
                username="demouser",
                password=hash_password("user123"),
                first_name="Demo",
                last_name="User",
                role=UserRole.USER
            )
            db.add(user)
            db.commit()
            print("[SEED] ✓ Demo user created with role: user")
        else:
            print("[SEED] Demo user already exists")
    except Exception as e:
        import traceback
        print(f"[SEED] ERROR: Could not seed users: {e}")
        traceback.print_exc()
    finally:
        db.close()

# Seed users on startup
seed_demo_users()

# Initialize FastAPI app
app = FastAPI(
    title="CollectiblesVault API",
    description="Backend API for managing collectible items and collections",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handler
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Database error occurred"}
    )


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# Root endpoint
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "name": "CollectiblesVault API",
        "version": "1.0.0",
        "description": "Backend API for managing collectible items and collections",
        "documentation": "/api/docs"
    }


# Include routers
app.include_router(auth.router)
app.include_router(collections.router)
app.include_router(items.router)
app.include_router(folders.router)
app.include_router(wishlists.router)
app.include_router(tags.router)
app.include_router(comments.router)
app.include_router(admin.router)
app.include_router(export.router)
app.include_router(categories.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=DEBUG
    )
