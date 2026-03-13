from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db
from models import User
from schemas import UserCreate, UserResponse, Token, UserUpdate, UserWithStats, LoginRequest
from auth import hash_password, verify_password, create_access_token, get_current_user, get_user_by_email
from config import ACCESS_TOKEN_EXPIRE_MINUTES
from sqlalchemy import func

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if email already exists
    existing_user_by_email = get_user_by_email(db, user.email)
    if existing_user_by_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_user_by_username = db.query(User).filter(User.username == user.username.lower()).first()
    if existing_user_by_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Validate password length
    if len(user.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    # Create new user
    hashed_password = hash_password(user.password)
    new_user = User(
        email=user.email.lower(),
        username=user.username.lower(),
        password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login user and return access token"""
    print(f"[DEBUG] Login attempt with email: {credentials.email}")
    
    user = get_user_by_email(db, credentials.email)
    print(f"[DEBUG] User found: {user is not None}")
    
    if user:
        print(f"[DEBUG] User ID: {user.id}, Password verification...")
        password_valid = verify_password(credentials.password, user.password)
        print(f"[DEBUG] Password valid: {password_valid}")
    
    if not user or not verify_password(credentials.password, user.password):
        print(f"[DEBUG] Login failed - Invalid credentials")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    print(f"[DEBUG] Login successful for user {user.email}")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id
    }


@router.get("/me", response_model=UserWithStats)
async def get_current_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile"""
    # Calculate statistics
    total_collections = len(current_user.collections)
    total_items = sum(len(col.items) for col in current_user.collections)
    total_value = sum(
        sum(item.cost for item in col.items) 
        for col in current_user.collections
    )
    
    return {
        **current_user.__dict__,
        "total_collections": total_collections,
        "total_items": total_items,
        "total_collection_value": total_value
    }


@router.put("/me", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name
    if user_update.password is not None:
        if len(user_update.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long"
            )
        current_user.password = hash_password(user_update.password)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
