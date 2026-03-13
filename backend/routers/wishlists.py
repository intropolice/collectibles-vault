from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, WishlistItem
from schemas import WishlistItemCreate, WishlistItemResponse, WishlistItemUpdate
from auth import get_current_user

router = APIRouter(prefix="/wishlists", tags=["wishlists"])


@router.post("", response_model=WishlistItemResponse)
async def create_wishlist_item(
    item: WishlistItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new wishlist item for the current user"""
    new_wishlist_item = WishlistItem(
        user_id=current_user.id,
        name=item.name,
        description=item.description,
        target_price=item.target_price,
        image_url=item.image_url
    )
    db.add(new_wishlist_item)
    db.commit()
    db.refresh(new_wishlist_item)
    
    return new_wishlist_item


@router.get("", response_model=list[WishlistItemResponse])
async def get_user_wishlists(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all wishlist items for the current user"""
    wishlists = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id
    ).order_by(WishlistItem.creation_date.desc()).all()
    
    return wishlists


@router.get("/{wishlist_id}", response_model=WishlistItemResponse)
async def get_wishlist_item(
    wishlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific wishlist item"""
    wishlist = db.query(WishlistItem).filter(
        WishlistItem.id == wishlist_id,
        WishlistItem.user_id == current_user.id
    ).first()
    
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    
    return wishlist


@router.put("/{wishlist_id}", response_model=WishlistItemResponse)
async def update_wishlist_item(
    wishlist_id: int,
    item_update: WishlistItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a wishlist item"""
    wishlist = db.query(WishlistItem).filter(
        WishlistItem.id == wishlist_id,
        WishlistItem.user_id == current_user.id
    ).first()
    
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    
    if item_update.name is not None:
        wishlist.name = item_update.name
    if item_update.description is not None:
        wishlist.description = item_update.description
    if item_update.target_price is not None:
        wishlist.target_price = item_update.target_price
    if item_update.image_url is not None:
        wishlist.image_url = item_update.image_url
    
    db.commit()
    db.refresh(wishlist)
    
    return wishlist


@router.delete("/{wishlist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wishlist_item(
    wishlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a wishlist item"""
    wishlist = db.query(WishlistItem).filter(
        WishlistItem.id == wishlist_id,
        WishlistItem.user_id == current_user.id
    ).first()
    
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    
    db.delete(wishlist)
    db.commit()
