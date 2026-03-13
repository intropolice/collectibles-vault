from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from database import get_db
from models import User, Collection, CollectibleItem, Tag, CollectionFolder, Attachment
from schemas import (
    CollectibleItemCreate, CollectibleItemResponse, CollectibleItemUpdate, FilterCriteria, ItemType
)
from fastapi import UploadFile, File
from config import UPLOAD_DIR, ALLOWED_IMAGE_TYPES, MAX_UPLOAD_SIZE
import os
from auth import get_current_user

router = APIRouter(prefix="/items", tags=["items"])


@router.get("/all", response_model=list[CollectibleItemResponse])
async def get_all_items(
    db: Session = Depends(get_db),
    min_price: float = Query(None),
    max_price: float = Query(None),
    item_type: ItemType = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("asc")
):
    """Get all items from database (global view for all users)"""
    
    # Build query with filters
    query = db.query(CollectibleItem).options(
        db.session.selectinload(CollectibleItem.collection).selectinload(Collection.owner)
    ) if hasattr(db, 'session') else db.query(CollectibleItem)
    
    if min_price is not None:
        query = query.filter(CollectibleItem.cost >= min_price)
    if max_price is not None:
        query = query.filter(CollectibleItem.cost <= max_price)
    if item_type is not None:
        query = query.filter(CollectibleItem.item_type == item_type)
    
    # Apply sorting
    if sort_by == "created_at":
        query = query.order_by(
            CollectibleItem.created_at.desc() if sort_order == "desc" 
            else CollectibleItem.created_at.asc()
        )
    elif sort_by == "name":
        query = query.order_by(
            CollectibleItem.name.desc() if sort_order == "desc" 
            else CollectibleItem.name.asc()
        )
    elif sort_by == "cost":
        query = query.order_by(
            CollectibleItem.cost.desc() if sort_order == "desc" 
            else CollectibleItem.cost.asc()
        )
    
    items = query.all()
    
    # Add user info (creator) from collection.owner
    result = []
    for item in items:
        item_dict = {
            "id": item.id,
            "collection_id": item.collection_id,
            "folder_id": item.folder_id,
            "name": item.name,
            "description": item.description,
            "item_type": item.item_type,
            "cost": item.cost,
            "acquisition_date": item.acquisition_date,
            "item_id": item.item_id,
            "weight": item.weight,
            "author": item.author,
            "nft_id": item.nft_id,
            "image_url": item.image_url,
            "secondary_image_url": item.secondary_image_url,
            "custom_fields_data": item.custom_fields_data,
            "tag_ids": [tag.id for tag in item.tags] if item.tags else [],
            "sort_order": item.sort_order,
            "created_at": item.created_at,
            "updated_at": item.updated_at,
            "tags": [{"id": t.id, "name": t.name} for t in item.tags] if item.tags else [],
            "assigned_user_id": item.assigned_user_id,
            "attachments": [],
            "userId": item.collection.owner.id if item.collection and item.collection.owner else None,
            "userName": f"{item.collection.owner.first_name} {item.collection.owner.last_name}" if item.collection and item.collection.owner else "Unknown"
        }
        result.append(CollectibleItemResponse(**item_dict))
    
    return result


@router.post("", response_model=CollectibleItemResponse)
async def create_item(
    collection_id: int,
    item: CollectibleItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new collectible item"""
    # Verify collection belongs to current user
    collection = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.user_id == current_user.id
    ).first()
    
    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found"
        )
    
    # Validate item_id format (first 2 chars = series)
    if len(item.item_id) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="item_id must have at least 2 characters for series identification"
        )
    
    # Validate cost
    if item.cost <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cost must be greater than 0"
        )
    
    # Create new item
    new_item = CollectibleItem(
        collection_id=collection_id,
        name=item.name,
        description=item.description,
        item_type=item.item_type,
        cost=item.cost,
        acquisition_date=item.acquisition_date,
        item_id=item.item_id.upper(),
        weight=item.weight,
        author=item.author,
        nft_id=item.nft_id,
        image_url=item.image_url,
        secondary_image_url=item.secondary_image_url,
        custom_fields_data=item.custom_fields_data or {}
    )
    
    # Attach tags if provided
    if item.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(item.tag_ids)).all()
        new_item.tags = tags
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return new_item


@router.get("/collection/{collection_id}", response_model=list[CollectibleItemResponse])
async def get_collection_items(
    collection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    min_price: float = Query(None),
    max_price: float = Query(None),
    item_type: ItemType = Query(None),
    min_weight: float = Query(None),
    max_weight: float = Query(None),
    tag_ids: list[int] = Query(None),
    assigned_user_id: int = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("asc")
):
    """Get items from a collection with filtering and sorting"""
    # Verify collection belongs to current user
    collection = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.user_id == current_user.id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    # Build query with filters
    query = db.query(CollectibleItem).filter(
        CollectibleItem.collection_id == collection_id
    )
    
    if min_price is not None:
        query = query.filter(CollectibleItem.cost >= min_price)
    if max_price is not None:
        query = query.filter(CollectibleItem.cost <= max_price)
    if item_type is not None:
        query = query.filter(CollectibleItem.item_type == item_type)
    if min_weight is not None:
        query = query.filter(CollectibleItem.weight >= min_weight)
    if max_weight is not None:
        query = query.filter(CollectibleItem.weight <= max_weight)
    
    # filter by assigned user
    if assigned_user_id is not None:
        query = query.filter(CollectibleItem.assigned_user_id == assigned_user_id)
    
    # Filter by tags if provided
    if tag_ids:
        query = query.filter(CollectibleItem.tags.any(Tag.id.in_(tag_ids)))
    
    # Apply sorting
    if sort_by == "created_at":
        query = query.order_by(
            CollectibleItem.created_at.desc() if sort_order == "desc" 
            else CollectibleItem.created_at.asc()
        )
    elif sort_by == "name":
        query = query.order_by(
            CollectibleItem.name.desc() if sort_order == "desc" 
            else CollectibleItem.name.asc()
        )
    elif sort_by == "cost":
        query = query.order_by(
            CollectibleItem.cost.desc() if sort_order == "desc" 
            else CollectibleItem.cost.asc()
        )
    elif sort_by == "sort_order":
        query = query.order_by(CollectibleItem.sort_order.asc())
    
    items = query.all()
    return items


@router.get("/{item_id}", response_model=CollectibleItemResponse)
async def get_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific collectible item"""
    item = db.query(CollectibleItem).filter(
        CollectibleItem.id == item_id,
        CollectibleItem.collection.has(Collection.user_id == current_user.id)
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return item


@router.put("/{item_id}", response_model=CollectibleItemResponse)
async def update_item(
    item_id: int,
    item_update: CollectibleItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a collectible item"""
    item = db.query(CollectibleItem).filter(
        CollectibleItem.id == item_id,
        CollectibleItem.collection.has(Collection.user_id == current_user.id)
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if item_update.name is not None:
        item.name = item_update.name
    if item_update.description is not None:
        item.description = item_update.description
    if item_update.cost is not None:
        item.cost = item_update.cost
    if item_update.weight is not None:
        item.weight = item_update.weight
    if item_update.author is not None:
        item.author = item_update.author
    if item_update.custom_fields_data is not None:
        item.custom_fields_data = item_update.custom_fields_data
    
    if item_update.tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(item_update.tag_ids)).all()
        item.tags = tags
    
    if item_update.assigned_user_id is not None:
        # ensure user is part of project or owner
        target = db.query(User).filter(User.id == item_update.assigned_user_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Assigned user not found")
        if target.id != item.collection.user_id and target not in item.collection.members:
            raise HTTPException(status_code=403, detail="User is not a member of the project")
        item.assigned_user_id = target.id
    
    db.commit()
    db.refresh(item)
    
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a collectible item"""
    item = db.query(CollectibleItem).filter(
        CollectibleItem.id == item_id,
        CollectibleItem.collection.has(Collection.user_id == current_user.id)
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(item)
    db.commit()


@router.post("/{item_id}/move-to-folder")
async def move_item_to_folder(
    item_id: int,
    folder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Move an item to a specific folder"""
    item = db.query(CollectibleItem).filter(
        CollectibleItem.id == item_id,
        CollectibleItem.collection.has(Collection.user_id == current_user.id)
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Verify folder belongs to the same collection
    folder = db.query(CollectionFolder).filter(
        CollectionFolder.id == folder_id,
        CollectionFolder.collection_id == item.collection_id
    ).first()
    
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    item.folder_id = folder_id
    db.commit()
    db.refresh(item)
    
    return {"message": "Item moved successfully", "item": item}


@router.post("/{item_id}/assign")
async def assign_item(
    item_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assign an executor to an item"""
    item = db.query(CollectibleItem).filter(
        CollectibleItem.id == item_id,
        CollectibleItem.collection.has(Collection.user_id == current_user.id)
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # ensure user exists and is member of project or owner
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    
    # check membership
    if target.id != item.collection.user_id and target not in item.collection.members:
        raise HTTPException(status_code=403, detail="User is not a member of the project")
    
    item.assigned_user_id = target.id
    db.commit()
    db.refresh(item)
    
    return {"message": "Item assigned", "item": item}


@router.post("/{item_id}/upload")
async def upload_attachment(
    item_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a file attachment to an item"""
    item = db.query(CollectibleItem).filter(
        CollectibleItem.id == item_id,
        CollectibleItem.collection.has(Collection.user_id == current_user.id)
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # basic size check
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    
    filename = file.filename
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        f.write(contents)
    
    attachment = Attachment(item_id=item_id, filename=filename, filepath=path)
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    
    return {"message": "Uploaded", "attachment_id": attachment.id}


@router.get("/{item_id}/attachments")
async def list_attachments(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List attachment filenames for item"""
    item = db.query(CollectibleItem).filter(
        CollectibleItem.id == item_id,
        CollectibleItem.collection.has(Collection.user_id == current_user.id)
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    files = [att.filename for att in item.attachments]
    return {"attachments": files}


@router.post("/{item_id}/reorder")
async def reorder_items(
    collection_id: int,
    order: dict,  # {item_id: sort_order}
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reorder items in a collection (drag and drop)"""
    # Verify collection belongs to current user
    collection = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.user_id == current_user.id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    # Update sort order for each item
    for item_id, sort_order in order.items():
        item = db.query(CollectibleItem).filter(
            CollectibleItem.id == item_id,
            CollectibleItem.collection_id == collection_id
        ).first()
        
        if item:
            item.sort_order = sort_order
    
    db.commit()
    return {"message": "Items reordered successfully"}


@router.post("/{item_id}/search-series")
async def search_by_series(
    collection_id: int,
    series_prefix: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search items by series (first two characters of item_id)"""
    # Verify collection belongs to current user
    collection = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.user_id == current_user.id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    items = db.query(CollectibleItem).filter(
        CollectibleItem.collection_id == collection_id,
        CollectibleItem.item_id.startswith(series_prefix)
    ).all()
    
    return items
