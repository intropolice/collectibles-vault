from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Category, User
from schemas import CategoryCreate, CategoryResponse, CategoryUpdate
from auth import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
async def get_user_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all categories for the current user"""
    categories = db.query(Category).filter(Category.user_id == current_user.id).all()
    return categories


@router.post("", response_model=CategoryResponse)
async def create_category(
    category: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new category for the current user"""
    # Check if category with same name already exists for this user
    existing = db.query(Category).filter(
        Category.user_id == current_user.id,
        Category.name == category.name
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{category.name}' already exists"
        )
    
    new_category = Category(
        user_id=current_user.id,
        name=category.name,
        icon=category.icon,
        color=category.color
    )
    
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    return new_category


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_update: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a category"""
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if new name conflicts with existing categories
    if category_update.name and category_update.name != category.name:
        existing = db.query(Category).filter(
            Category.user_id == current_user.id,
            Category.name == category_update.name
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category '{category_update.name}' already exists"
            )
    
    if category_update.name:
        category.name = category_update.name
    if category_update.icon:
        category.icon = category_update.icon
    if category_update.color:
        category.color = category_update.color
    
    db.commit()
    db.refresh(category)
    
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a category"""
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    db.delete(category)
    db.commit()
    
    return None
