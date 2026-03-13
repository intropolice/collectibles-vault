from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import User, Collection, CollectibleItem, AdminStatistics
from schemas import AdminDashboard, AdminStatisticsResponse, CollectionsOverview, UserSimple
from auth import get_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserSimple])
async def get_all_users(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users in the system (admin only)"""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users


@router.get("/statistics", response_model=AdminStatisticsResponse)
async def get_statistics(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get overall system statistics (admin only)"""
    total_users = db.query(func.count(User.id)).scalar()
    total_collections = db.query(func.count(Collection.id)).scalar()
    total_items = db.query(func.count(CollectibleItem.id)).scalar()
    total_value = db.query(func.sum(CollectibleItem.cost)).scalar() or 0.0
    
    # Update or create admin statistics record
    admin_stats = db.query(AdminStatistics).first()
    if admin_stats:
        admin_stats.total_users = total_users
        admin_stats.total_collections = total_collections
        admin_stats.total_items = total_items
        admin_stats.total_value = total_value
    else:
        admin_stats = AdminStatistics(
            total_users=total_users,
            total_collections=total_collections,
            total_items=total_items,
            total_value=total_value
        )
        db.add(admin_stats)
    
    db.commit()
    db.refresh(admin_stats)
    
    return admin_stats


@router.get("/dashboard", response_model=AdminDashboard)
async def get_admin_dashboard(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get admin dashboard with statistics and overview"""
    # Get statistics
    total_users = db.query(func.count(User.id)).scalar()
    total_collections = db.query(func.count(Collection.id)).scalar()
    total_items = db.query(func.count(CollectibleItem.id)).scalar()
    total_value = db.query(func.sum(CollectibleItem.cost)).scalar() or 0.0
    
    admin_stats = db.query(AdminStatistics).first()
    if not admin_stats:
        admin_stats = AdminStatistics(
            total_users=total_users,
            total_collections=total_collections,
            total_items=total_items,
            total_value=total_value
        )
        db.add(admin_stats)
        db.commit()
    
    # Get top collections by value
    top_collections = db.query(
        Collection.id,
        Collection.name,
        func.count(CollectibleItem.id).label("item_count"),
        func.sum(CollectibleItem.cost).label("total_value")
    ).join(CollectibleItem).group_by(Collection.id, Collection.name).order_by(
        func.sum(CollectibleItem.cost).desc()
    ).limit(5).all()
    
    top_collections_overview = [
        CollectionsOverview(
            collection_id=col[0],
            collection_name=col[1],
            item_count=col[2],
            total_value=col[3] or 0.0
        )
        for col in top_collections
    ]
    
    # Get recent collections
    recent_collections = db.query(
        Collection.id,
        Collection.name,
        func.count(CollectibleItem.id).label("item_count"),
        func.sum(CollectibleItem.cost).label("total_value")
    ).join(CollectibleItem, isouter=True).group_by(Collection.id, Collection.name).order_by(
        Collection.created_at.desc()
    ).limit(5).all()
    
    recent_collections_overview = [
        CollectionsOverview(
            collection_id=col[0],
            collection_name=col[1],
            item_count=col[2] or 0,
            total_value=col[3] or 0.0
        )
        for col in recent_collections
    ]
    
    return {
        "statistics": {
            "total_users": total_users,
            "total_collections": total_collections,
            "total_items": total_items,
            "total_value": total_value,
            "last_updated": admin_stats.last_updated
        },
        "top_collections": top_collections_overview,
        "recent_collections": recent_collections_overview
    }


@router.get("/users", response_model=list[dict])
async def get_all_users(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get list of all users (admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    
    result = []
    for user in users:
        total_value = sum(
            sum(item.cost for item in col.items)
            for col in user.collections
        )
        result.append({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "created_at": user.created_at,
            "collection_count": len(user.collections),
            "item_count": sum(len(col.items) for col in user.collections),
            "total_value": total_value
        })
    
    return result


@router.get("/collections", response_model=list[CollectionsOverview])
async def get_all_collections(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get list of all collections (admin only)"""
    collections = db.query(
        Collection.id,
        Collection.name,
        func.count(CollectibleItem.id).label("item_count"),
        func.sum(CollectibleItem.cost).label("total_value")
    ).join(CollectibleItem, isouter=True).group_by(Collection.id, Collection.name).offset(
        skip
    ).limit(limit).all()
    
    return [
        CollectionsOverview(
            collection_id=col[0],
            collection_name=col[1],
            item_count=col[2] or 0,
            total_value=col[3] or 0.0
        )
        for col in collections
    ]


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
