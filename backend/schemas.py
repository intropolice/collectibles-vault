from pydantic import BaseModel, Field, EmailStr, field_validator, model_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
import re

class ItemType(str, Enum):
    PHYSICAL = "physical"
    INFORMATIONAL = "informational"
    NFT = "nft"


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Validate username format: only lowercase letters, numbers, underscores"""
        if not re.match(r'^[a-z0-9_]+$', v):
            raise ValueError('Username can only contain lowercase letters (a-z), numbers (0-9), and underscores (_)')
        if v.startswith('_') or v.endswith('_'):
            raise ValueError('Username cannot start or end with underscore')
        if '__' in v:
            raise ValueError('Username cannot contain consecutive underscores')
        return v
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Validate email format"""
        if not v or not v.strip():
            raise ValueError('Email cannot be empty')
        return v.lower().strip()
    
    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_names(cls, v: str) -> str:
        """Validate names"""
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength"""
        if not v or len(v.strip()) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    password: Optional[str] = Field(None, min_length=8, max_length=100)


class UserSimple(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    username: str
    
    class Config:
        from_attributes = True


class UserResponse(UserBase):
    id: int
    role: str = "user"
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserWithStats(UserResponse):
    total_collections: int = 0
    total_items: int = 0
    total_collection_value: float = 0.0


# Login Schema
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int


class TokenData(BaseModel):
    email: Optional[str] = None


# Tag Schemas
class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    id: int
    
    class Config:
        from_attributes = True


# Custom Field Schemas
class CustomFieldBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    field_type: str  # text, number, date, select, etc.


class CustomFieldCreate(CustomFieldBase):
    pass


class CustomFieldResponse(CustomFieldBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True


# Wishlist Item Schemas
class WishlistItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    target_price: Optional[float] = Field(None, ge=0)
    image_url: Optional[str] = None


class WishlistItemCreate(WishlistItemBase):
    pass


class WishlistItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    target_price: Optional[float] = Field(None, ge=0)
    image_url: Optional[str] = None


class WishlistItemResponse(WishlistItemBase):
    id: int
    user_id: int
    creation_date: datetime
    
    class Config:
        from_attributes = True


# Collectible Item Schemas
class CollectibleItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    item_type: ItemType = ItemType.PHYSICAL
    cost: float = Field(..., gt=0)
    acquisition_date: datetime
    item_id: str = Field(..., min_length=2, max_length=50)
    weight: Optional[float] = Field(None, gt=0)
    author: Optional[str] = Field(None, max_length=200)
    nft_id: Optional[str] = Field(None, max_length=100)
    image_url: Optional[str] = None
    secondary_image_url: Optional[str] = None
    custom_fields_data: Optional[dict] = Field(default_factory=dict)
    tag_ids: Optional[List[int]] = []
    
    @field_validator('item_id')
    @classmethod
    def validate_item_id(cls, v):
        """Validate item_id format - first 2 chars represent series"""
        if len(v) < 2:
            raise ValueError('item_id must have at least 2 characters (series code)')
        return v.upper()
    
    @field_validator('cost')
    @classmethod
    def validate_cost(cls, v):
        """Ensure cost is a positive number"""
        if v <= 0:
            raise ValueError('Cost must be greater than 0')
        return round(v, 2)


class CollectibleItemCreate(CollectibleItemBase):
    pass


class CollectibleItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    cost: Optional[float] = Field(None, gt=0)
    weight: Optional[float] = Field(None, gt=0)
    author: Optional[str] = Field(None, max_length=200)
    custom_fields_data: Optional[dict] = None
    tag_ids: Optional[List[int]] = None
    assigned_user_id: Optional[int] = None


class CollectibleItemResponse(CollectibleItemBase):
    id: int
    collection_id: int
    folder_id: Optional[int]
    sort_order: int
    created_at: datetime
    updated_at: datetime
    tags: List[TagResponse] = []
    assigned_user_id: Optional[int] = None
    attachments: List[str] = []  # list of filenames
    userId: Optional[int] = None  # Creator user ID
    userName: Optional[str] = None  # Creator user name for display
    
    class Config:
        from_attributes = True


# Collection Folder Schemas
class CollectionFolderBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)


class CollectionFolderCreate(CollectionFolderBase):
    pass


class CollectionFolderUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)


class CollectionFolderResponse(CollectionFolderBase):
    id: int
    collection_id: int
    created_at: datetime
    items: List[CollectibleItemResponse] = []
    
    class Config:
        from_attributes = True


# Collection Schemas
class CollectionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)


class CollectionCreate(CollectionBase):
    pass


class CollectionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)


class CollectionResponse(CollectionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    items: List[CollectibleItemResponse] = []
    folders: List[CollectionFolderResponse] = []
    members: List[UserResponse] = []
    
    class Config:
        from_attributes = True


class CollectionStats(BaseModel):
    total_items: int
    total_value: float
    most_expensive_item: Optional[str]
    items_by_type: dict
    items_by_assignee: Optional[dict] = {}


class CollectionWithStats(CollectionResponse):
    stats: CollectionStats


# Search and Filter Schemas
class FilterCriteria(BaseModel):
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    item_type: Optional[ItemType] = None
    min_weight: Optional[float] = None
    max_weight: Optional[float] = None
    tags: Optional[List[int]] = []
    sort_by: Optional[str] = "created_at"  # created_at, name, cost, sort_order
    sort_order: Optional[str] = "asc"  # asc, desc


# Admin Schemas
class AdminStatisticsResponse(BaseModel):
    total_users: int
    total_collections: int
    total_items: int
    total_value: float
    last_updated: datetime
    
    class Config:
        from_attributes = True


class CollectionsOverview(BaseModel):
    collection_id: int
    collection_name: str
    item_count: int
    total_value: float


class AdminDashboard(BaseModel):
    statistics: AdminStatisticsResponse
    top_collections: List[CollectionsOverview]
    recent_collections: List[CollectionsOverview]


# Comment Schemas
class CommentBase(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


class CommentCreate(CommentBase):
    pass


class CommentResponse(CommentBase):
    id: int
    item_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CommentWithUser(CommentResponse):
    user: Optional[UserResponse] = None


# Category Schemas
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    icon: str = Field(default="📦", max_length=10)
    color: str = Field(default="slate", max_length=50)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    icon: Optional[str] = Field(None, max_length=10)
    color: Optional[str] = Field(None, max_length=50)


class CategoryResponse(CategoryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# PDF Export Schema
class PDFExportRequest(BaseModel):
    collection_id: Optional[int] = None
    include_images: bool = True
    include_custom_fields: bool = True
