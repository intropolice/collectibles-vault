from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Enum, Table, JSON
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum

# Association table for many-to-many relationship between items and tags
item_tags = Table(
    'item_tags',
    Base.metadata,
    Column('item_id', Integer, ForeignKey('collectible_item.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tag.id'), primary_key=True),
    extend_existing=True
)

# Association table for many-to-many relationship between collections and folders
project_members = Table(
    'project_members',
    Base.metadata,
    Column('collection_id', Integer, ForeignKey('collection.id'), primary_key=True),
    Column('user_id', Integer, ForeignKey('user.id'), primary_key=True),
    extend_existing=True
)

class ItemType(str, enum.Enum):
    PHYSICAL = "physical"
    INFORMATIONAL = "informational"
    NFT = "nft"


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "user"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.USER)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    collections = relationship("Collection", back_populates="owner", cascade="all, delete-orphan")
    wishlists = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan")
    custom_fields = relationship("CustomField", back_populates="user", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    member_of_collections = relationship(
        "Collection",
        secondary="project_members",
        back_populates="members"
    )


class Category(Base):
    __tablename__ = "category"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    name = Column(String, index=True, nullable=False)
    icon = Column(String, default="📦")  # Emoji or icon name
    color = Column(String, default="slate")  # Color for display
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="categories")


class Collection(Base):
    __tablename__ = "collection"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    name = Column(String, index=True)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    owner = relationship("User", back_populates="collections")
    items = relationship("CollectibleItem", back_populates="collection", cascade="all, delete-orphan")
    folders = relationship("CollectionFolder", back_populates="collection", cascade="all, delete-orphan")
    # project members (other users besides owner)
    members = relationship(
        "User",
        secondary="project_members",
        back_populates="member_of_collections"
    )


class CollectionFolder(Base):
    __tablename__ = "collection_folder"
    
    id = Column(Integer, primary_key=True, index=True)
    collection_id = Column(Integer, ForeignKey("collection.id"), nullable=False)
    name = Column(String, index=True)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    collection = relationship("Collection", back_populates="folders")
    items = relationship("CollectibleItem", back_populates="folder")


class CollectibleItem(Base):
    __tablename__ = "collectible_item"
    
    id = Column(Integer, primary_key=True, index=True)
    collection_id = Column(Integer, ForeignKey("collection.id"), nullable=False)
    folder_id = Column(Integer, ForeignKey("collection_folder.id"), nullable=True)
    name = Column(String, index=True)
    description = Column(Text)
    item_type = Column(Enum(ItemType), default=ItemType.PHYSICAL)
    
    # Required fields
    cost = Column(Float, nullable=False)
    acquisition_date = Column(DateTime, nullable=False)
    item_id = Column(String, index=True)  # First two characters represent series
    
    # Optional fields based on type
    weight = Column(Float)  # For physical items
    author = Column(String)  # For art items
    nft_id = Column(String)  # For NFT items
    
    # Images
    image_url = Column(String)  # Main image
    secondary_image_url = Column(String)  # For NFT coin reverse side
    
    # Sorting
    sort_order = Column(Integer, default=0)
    
    # Custom fields (stored as JSON)
    custom_fields_data = Column(JSON, default={})
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    collection = relationship("Collection", back_populates="items")
    folder = relationship("CollectionFolder", back_populates="items")
    tags = relationship("Tag", secondary=item_tags, back_populates="items")
    comments = relationship("Comment", back_populates="item", cascade="all, delete-orphan")
    assigned_user_id = Column(Integer, ForeignKey('user.id'), nullable=True)
    assigned_user = relationship("User")
    attachments = relationship("Attachment", back_populates="item", cascade="all, delete-orphan")


class Tag(Base):
    __tablename__ = "tag"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    items = relationship("CollectibleItem", secondary=item_tags, back_populates="tags")


class WishlistItem(Base):
    __tablename__ = "wishlist_item"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    name = Column(String)
    description = Column(Text)
    target_price = Column(Float)
    image_url = Column(String)
    creation_date = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="wishlists")


class CustomField(Base):
    __tablename__ = "custom_field"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    name = Column(String)
    field_type = Column(String)  # text, number, date, etc.
    
    user = relationship("User", back_populates="custom_fields")


class Comment(Base):
    __tablename__ = "comment"
    
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("collectible_item.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    item = relationship("CollectibleItem", back_populates="comments")
    user = relationship("User")


class Attachment(Base):
    __tablename__ = "attachment"
    
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("collectible_item.id"), nullable=False)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    item = relationship("CollectibleItem", back_populates="attachments")


class AdminStatistics(Base):
    __tablename__ = "admin_statistics"
    
    id = Column(Integer, primary_key=True, index=True)
    total_users = Column(Integer, default=0)
    total_collections = Column(Integer, default=0)
    total_items = Column(Integer, default=0)
    total_value = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
