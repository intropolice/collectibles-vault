from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, Collection, CollectionFolder
from schemas import CollectionFolderCreate, CollectionFolderResponse, CollectionFolderUpdate
from auth import get_current_user

router = APIRouter(prefix="/folders", tags=["folders"])


@router.post("", response_model=CollectionFolderResponse)
async def create_folder(
    collection_id: int,
    folder: CollectionFolderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new folder in a collection"""
    # Verify collection belongs to current user
    collection = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.user_id == current_user.id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    new_folder = CollectionFolder(
        collection_id=collection_id,
        name=folder.name,
        description=folder.description
    )
    db.add(new_folder)
    db.commit()
    db.refresh(new_folder)
    
    return new_folder


@router.get("/collection/{collection_id}", response_model=list[CollectionFolderResponse])
async def get_collection_folders(
    collection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all folders in a collection"""
    # Verify collection belongs to current user
    collection = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.user_id == current_user.id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    folders = db.query(CollectionFolder).filter(
        CollectionFolder.collection_id == collection_id
    ).all()
    
    return folders


@router.get("/{folder_id}", response_model=CollectionFolderResponse)
async def get_folder(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific folder with its items"""
    folder = db.query(CollectionFolder).filter(
        CollectionFolder.id == folder_id,
        CollectionFolder.collection.has(Collection.user_id == current_user.id)
    ).first()
    
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    return folder


@router.put("/{folder_id}", response_model=CollectionFolderResponse)
async def update_folder(
    folder_id: int,
    folder_update: CollectionFolderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a folder"""
    folder = db.query(CollectionFolder).filter(
        CollectionFolder.id == folder_id,
        CollectionFolder.collection.has(Collection.user_id == current_user.id)
    ).first()
    
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    if folder_update.name is not None:
        folder.name = folder_update.name
    if folder_update.description is not None:
        folder.description = folder_update.description
    
    db.commit()
    db.refresh(folder)
    
    return folder


@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a folder"""
    folder = db.query(CollectionFolder).filter(
        CollectionFolder.id == folder_id,
        CollectionFolder.collection.has(Collection.user_id == current_user.id)
    ).first()
    
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Delete all items in the folder
    from models import CollectibleItem
    db.query(CollectibleItem).filter(
        CollectibleItem.folder_id == folder_id
    ).delete()
    
    db.delete(folder)
    db.commit()
