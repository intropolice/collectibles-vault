from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, Collection, CollectibleItem, Comment
from schemas import CommentCreate, CommentResponse, CommentWithUser
from auth import get_current_user

router = APIRouter(prefix="/comments", tags=["comments"])


@router.post("/items/{item_id}", response_model=CommentResponse)
async def create_comment(
    item_id: int,
    comment: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a comment on an item"""
    # Verify item exists and belongs to current user's collection
    item = db.query(CollectibleItem).filter(
        CollectibleItem.id == item_id,
        CollectibleItem.collection.has(Collection.user_id == current_user.id)
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    if not comment.text or not comment.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comment text cannot be empty"
        )
    
    new_comment = Comment(
        item_id=item_id,
        user_id=current_user.id,
        text=comment.text.strip()
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return new_comment


@router.get("/items/{item_id}", response_model=list[CommentWithUser])
async def get_item_comments(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all comments for an item"""
    # Verify item exists and belongs to current user's collection
    item = db.query(CollectibleItem).filter(
        CollectibleItem.id == item_id,
        CollectibleItem.collection.has(Collection.user_id == current_user.id)
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    comments = db.query(Comment).filter(
        Comment.item_id == item_id
    ).order_by(Comment.created_at.desc()).all()
    
    return comments


@router.get("/{comment_id}", response_model=CommentWithUser)
async def get_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific comment"""
    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.item.has(
            CollectibleItem.collection.has(Collection.user_id == current_user.id)
        )
    ).first()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    return comment


@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment_update: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a comment (only owner can update)"""
    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.item.has(
            CollectibleItem.collection.has(Collection.user_id == current_user.id)
        )
    ).first()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own comments"
        )
    
    if not comment_update.text or not comment_update.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comment text cannot be empty"
        )
    
    comment.text = comment_update.text.strip()
    db.commit()
    db.refresh(comment)
    
    return comment


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a comment (only owner can delete)"""
    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.item.has(
            CollectibleItem.collection.has(Collection.user_id == current_user.id)
        )
    ).first()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own comments"
        )
    
    db.delete(comment)
    db.commit()
