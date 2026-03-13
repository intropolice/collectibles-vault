from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, Tag
from schemas import TagCreate, TagResponse
from auth import get_current_user

router = APIRouter(prefix="/tags", tags=["tags"])


@router.post("", response_model=TagResponse)
async def create_tag(
    tag: TagCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new tag"""
    # Check if tag already exists
    existing_tag = db.query(Tag).filter(Tag.name == tag.name).first()
    if existing_tag:
        return existing_tag
    
    new_tag = Tag(name=tag.name)
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)
    
    return new_tag


@router.get("", response_model=list[TagResponse])
async def get_all_tags(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all available tags"""
    tags = db.query(Tag).all()
    return tags


@router.get("/{tag_id}", response_model=TagResponse)
async def get_tag(
    tag_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific tag"""
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    return tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a tag"""
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    db.delete(tag)
    db.commit()
