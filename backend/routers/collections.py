from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, Collection, CollectibleItem, CollectionFolder
from schemas import (
    CollectionCreate, CollectionResponse, CollectionUpdate, 
    CollectionWithStats, CollectionStats, CollectionsOverview
)
from auth import get_current_user

router = APIRouter(prefix="/collections", tags=["collections"])


@router.post("", response_model=CollectionResponse)
async def create_collection(
    collection: CollectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new collection for the current user"""
    new_collection = Collection(
        user_id=current_user.id,
        name=collection.name,
        description=collection.description
    )
    db.add(new_collection)
    db.commit()
    db.refresh(new_collection)
    
    return new_collection


@router.get("", response_model=list[CollectionResponse])
async def get_user_collections(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all collections for the current user"""
    collections = db.query(Collection).filter(
        Collection.user_id == current_user.id
    ).all()
    return collections


@router.get("/{collection_id}", response_model=CollectionResponse)
async def get_collection(
    collection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific collection with its items"""
    collection = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.user_id == current_user.id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    return collection


@router.get("/{collection_id}/stats", response_model=CollectionStats)
async def get_collection_stats(
    collection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get statistics for a specific collection"""
    collection = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.user_id == current_user.id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    items = collection.items
    total_items = len(items)
    total_value = sum(item.cost for item in items)
    
    items_by_type = {}
    items_by_assignee = {}
    for item in items:
        item_type = item.item_type.value
        items_by_type[item_type] = items_by_type.get(item_type, 0) + 1
        if item.assigned_user_id:
            items_by_assignee[item.assigned_user_id] = items_by_assignee.get(item.assigned_user_id, 0) + 1
    
    most_expensive = max(items, key=lambda x: x.cost, default=None)
    
    return {
        "total_items": total_items,
        "total_value": total_value,
        "most_expensive_item": most_expensive.name if most_expensive else None,
        "items_by_type": items_by_type,
        "items_by_assignee": items_by_assignee
    }


@router.put("/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: int,
    collection_update: CollectionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a collection"""
    collection = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.user_id == current_user.id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    if collection_update.name is not None:
        collection.name = collection_update.name
    if collection_update.description is not None:
        collection.description = collection_update.description
    
    db.commit()
    db.refresh(collection)
    
    return collection


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(
    collection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a collection"""
    collection = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.user_id == current_user.id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    db.delete(collection)
    db.commit()


@router.post("/{collection_id}/members")
async def add_member(
    collection_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a member to a collection/project"""
    collection = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.user_id == current_user.id
    ).first()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user in collection.members:
        return {"message": "User already a member"}
    
    collection.members.append(user)
    db.commit()
    return {"message": "Member added"}


@router.delete("/{collection_id}/members/{user_id}")
async def remove_member(
    collection_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a member from a collection/project"""
    collection = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.user_id == current_user.id
    ).first()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user and user in collection.members:
        collection.members.remove(user)
        db.commit()
    return {"message": "Member removed if existed"}


@router.get("/{collection_id}/overview", response_model=CollectionsOverview)
async def get_collection_overview(
    collection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get collection overview with basic stats"""
    collection = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.user_id == current_user.id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    total_value = sum(item.cost for item in collection.items)
    
    return {
        "collection_id": collection.id,
        "collection_name": collection.name,
        "item_count": len(collection.items),
        "total_value": total_value
    }
