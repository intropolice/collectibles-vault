# Project Files Reference

## Directory Structure
```
collectibles-vault/
├── Core Application Files
│   ├── main.py                    # FastAPI application entry point
│   ├── config.py                  # Configuration management
│   ├── database.py                # Database setup and ORM
│   ├── models.py                  # SQLAlchemy database models
│   ├── schemas.py                 # Pydantic validation schemas
│   └── auth.py                    # Authentication logic
│
├── API Routers
│   └── routers/
│       ├── __init__.py
│       ├── auth.py                # Authentication endpoints
│       ├── collections.py         # Collection management
│       ├── items.py               # Item management
│       ├── folders.py             # Folder management
│       ├── wishlists.py           # Wishlist endpoints
│       ├── tags.py                # Tag management
│       ├── admin.py               # Admin endpoints
│       └── export.py              # PDF export
│
├── Configuration Files
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example               # Environment variables template
│   ├── .gitignore                 # Git ignore patterns
│   ├── Dockerfile                 # Docker image definition
│   └── docker-compose.yml         # Docker Compose setup
│
├── Setup & Utility Scripts
│   ├── setup.sh                   # Linux/Mac setup script
│   ├── setup.bat                  # Windows setup script
│   └── check_requirements.py      # Requirements verification script
│
└── Documentation
    ├── README.md                  # Complete documentation
    ├── QUICKSTART.md              # Quick setup guide
    ├── API_EXAMPLES.md            # Comprehensive API examples
    ├── IMPLEMENTATION_SUMMARY.md  # Implementation overview
    └── PROJECT_FILES.md           # This file
```

## Detailed File Descriptions

### Core Application Files

#### main.py (425 lines)
- **Purpose**: FastAPI application initialization and route registration
- **Key Components**:
  - FastAPI app initialization with custom settings
  - CORS middleware configuration
  - Database table creation on startup
  - Route inclusion from all routers
  - Health check endpoint
  - Root endpoint with API information
  - Error handling for SQLAlchemy exceptions
  - Uvicorn server configuration

#### config.py (25 lines)
- **Purpose**: Centralized configuration management
- **Key Settings**:
  - PostgreSQL database URL
  - JWT configuration (secret key, algorithm, expiration)
  - Admin credentials
  - Debug mode
  - Upload directory path
  - File size and type restrictions

#### database.py (15 lines)
- **Purpose**: Database connection and session management
- **Key Functions**:
  - SQLAlchemy engine creation
  - SessionLocal factory setup
  - Base declarative for ORM models
  - Dependency injection for database sessions

#### models.py (160 lines)
- **Purpose**: SQLAlchemy database models and relationships
- **Models Defined**:
  - User: App users with authentication
  - Collection: User's collections
  - CollectibleItem: Individual items with 3 types
  - CollectionFolder: Folders within collections
  - WishlistItem: User's wishlist
  - Tag: Tags for items (many-to-many)
  - CustomField: User-defined fields
  - AdminStatistics: System metrics

#### schemas.py (245 lines)
- **Purpose**: Pydantic models for request/response validation
- **Schema Categories**:
  - User schemas (Create, Update, Response, WithStats)
  - Collection schemas (Create, Update, Response, Stats)
  - Item schemas (Create, Update, Response, ItemType enum)
  - Folder schemas (Create, Update, Response)
  - Wishlist schemas (Create, Update, Response)
  - Tag schemas (Create, Response)
  - Filter/search schemas
  - Admin schemas
  - Token schemas
  - Export schemas

#### auth.py (70 lines)
- **Purpose**: Authentication logic and JWT handling
- **Key Functions**:
  - `hash_password()`: Bcrypt password hashing
  - `verify_password()`: Password verification
  - `create_access_token()`: JWT token generation
  - `get_current_user()`: Dependency for protected routes
  - `get_admin_user()`: Dependency for admin routes
  - `get_user_by_email()`: Database user lookup

### API Route Files

#### routers/auth.py (80 lines)
- **Endpoints**:
  - POST /auth/register - User registration
  - POST /auth/login - User login with JWT
  - GET /auth/me - Current user profile
  - PUT /auth/me - Update user profile
  - GET /auth/users/{user_id} - Get user by ID

#### routers/collections.py (100 lines)
- **Endpoints**:
  - CRUD operations for collections
  - Statistics and overview endpoints
  - Collection management with user isolation

#### routers/items.py (160 lines)
- **Endpoints**:
  - CRUD operations for collectible items
  - Advanced filtering and sorting
  - Folder management
  - Item reordering (drag & drop)
  - Series-based search

#### routers/folders.py (90 lines)
- **Endpoints**:
  - CRUD operations for collection folders
  - Folder item management
  - Folder organization

#### routers/wishlists.py (80 lines)
- **Endpoints**:
  - CRUD operations for wishlist items
  - Wishlist management
  - Price tracking

#### routers/tags.py (65 lines)
- **Endpoints**:
  - CRUD operations for tags
  - Tag management and filtering

#### routers/admin.py (150 lines)
- **Endpoints**:
  - GET /admin/statistics - System statistics
  - GET /admin/dashboard - Admin dashboard
  - GET /admin/users - All users list
  - GET /admin/collections - All collections overview
  - DELETE /admin/users/{id} - User deletion

#### routers/export.py (300+ lines)
- **Endpoints**:
  - POST /export/pdf-collection/{id} - Single collection PDF
  - POST /export/pdf-all-collections - All collections PDF
- **Features**:
  - Professional PDF generation with ReportLab
  - Statistics tables
  - Item listings
  - Custom fields display
  - Optional image inclusion

### Configuration Files

#### requirements.txt (16 packages)
Key dependencies:
- fastapi==0.104.1
- uvicorn==0.24.0
- sqlalchemy==2.0.23
- psycopg2-binary==2.9.9
- pydantic==2.5.0
- passlib==1.7.4
- python-jose==3.3.0
- cryptography==41.0.7
- bcrypt==4.1.1
- reportlab==4.0.7
- (and more)

#### .env.example (11 lines)
Template for environment variables:
- DATABASE_URL
- SECRET_KEY
- JWT settings
- Admin credentials
- Debug mode
- Upload directory

#### .gitignore (60+ patterns)
Ignores:
- Python cache and compiled files
- Virtual environment
- IDE files (.vscode, .idea)
- Environment files (.env)
- Database files
- OS-specific files

#### Dockerfile (20 lines)
- Python 3.11 slim base image
- System dependencies installation
- Python packages installation
- App setup
- Port exposure (8000)
- Uvicorn startup command

#### docker-compose.yml (40 lines)
- PostgreSQL service (version 15-alpine)
- FastAPI application service
- Volume management for database persistence
- Health checks
- Network configuration
- Environment variable setup

### Setup & Utility Scripts

#### setup.sh (60 lines)
Linux/Mac automated setup script:
1. Checks Python version
2. Creates virtual environment
3. Installs dependencies
4. Sets up environment variables
5. Creates uploads directory
6. Provides next steps

#### setup.bat (70 lines)
Windows automated setup script:
- Same functionality as setup.sh
- Uses Windows commands and paths
- Batch file syntax

#### check_requirements.py (120 lines)
Python verification utility:
- Checks Python 3.9+ installation
- Verifies all dependencies
- Checks PostgreSQL client availability
- Checks Docker availability
- Provides helpful error messages

### Documentation Files

#### README.md (600+ lines)
Complete documentation including:
- Project overview and features
- Installation instructions
- Configuration guide
- Complete API endpoint reference (35+ endpoints)
- Database schema explanation
- Authentication workflows
- Query parameter examples
- Security information
- Development setup
- Production deployment guides
- Performance considerations
- Future enhancements

#### QUICKSTART.md (200+ lines)
Quick 5-minute setup guide:
- Prerequisites
- Step-by-step setup (6 steps)
- Quick API testing examples
- Troubleshooting tips
- Common commands
- Default admin access info

#### API_EXAMPLES.md (800+ lines)
Comprehensive API examples:
- Complete workflow with requests/responses
- User registration and authentication
- Collection management examples
- Item creation (physical, NFT, informational)
- Filtering and sorting examples
- Folder operations
- Wishlist management
- PDF export examples
- Admin functions
- Error response examples
- Best practices
- cURL and Postman instructions

#### IMPLEMENTATION_SUMMARY.md (280 lines)
Complete implementation overview:
- Project overview
- What's been created (detailed breakdown)
- Key features implemented (checkmarks)
- Technology stack
- Database schema
- Security features
- API documentation info
- Project structure with line counts
- Getting started guide
- Next steps

#### PROJECT_FILES.md (This file)
Complete file reference and descriptions

## Quick Navigation Guide

### To Understand the Architecture
→ Read: `IMPLEMENTATION_SUMMARY.md`

### To Get Started Quickly
→ Read: `QUICKSTART.md`

### To See API Examples
→ Read: `API_EXAMPLES.md`

### To Understand the Code
→ Read: `models.py` → `schemas.py` → `main.py` → `routers/*`

### To Deploy the Application
→ Use: `docker-compose.yml` or follow `README.md` deployment section

### To Verify Installation
→ Run: `python check_requirements.py`

### To Setup Automatically
→ Run: `./setup.sh` (Linux/Mac) or `setup.bat` (Windows)

## File Statistics

| Category | Files | Lines |
|----------|-------|-------|
| Python Core | 6 | 900 |
| Python Routers | 8 | 1,200 |
| Configuration | 5 | 150 |
| Utilities | 3 | 250 |
| Documentation | 5 | 2,000+ |
| **Total** | **27** | **4,500+** |

## Key Features by File

### User Management
- File: `auth.py`, `routers/auth.py`
- Features: Registration, login, profile management, password hashing

### Data Models
- File: `models.py`
- Features: User, Collection, Item (3 types), Folder, Wishlist, Tag

### API Endpoints
- File: `routers/*` (8 files)
- Features: 35+ endpoints across 8 categories

### Data Export
- File: `routers/export.py`
- Features: PDF generation, collection reports, statistics

### Access Control
- File: `auth.py`
- Features: JWT tokens, user isolation, admin verification

### Data Validation
- File: `schemas.py`
- Features: Pydantic models, type validation, error messages

## Testing the Installation

1. **Check Python**:
   ```bash
   python --version
   ```

2. **Check Dependencies** (after install):
   ```bash
   python check_requirements.py
   ```

3. **Run Locally** (after setup):
   ```bash
   python main.py
   ```

4. **Test API**:
   - Visit: `http://localhost:8000/api/docs`
   - Try endpoints in interactive Swagger UI

5. **Run with Docker** (if Docker installed):
   ```bash
   docker-compose up
   ```

## Maintenance

### Adding New Endpoints
1. Create router in `routers/` with `@router.` decorators
2. Add schemas to `schemas.py`
3. Include router in `main.py`

### Adding New Models
1. Define in `models.py` with SQLAlchemy
2. Add corresponding schemas to `schemas.py`
3. Create router for CRUD operations

### Updating Dependencies
1. Update version in `requirements.txt`
2. Reinstall: `pip install -r requirements.txt`

### Database Changes
1. Modify models in `models.py`
2. Tables auto-create on startup (development)
3. For production, use Alembic migrations (future enhancement)

## Support & Troubleshooting

See **TROUBLESHOOTING** section in:
- `QUICKSTART.md` - Common setup issues
- `README.md` - General issues
- `API_EXAMPLES.md` - Request/response examples

---

**Total Project Files**: 27
**Total Code Lines**: 4,500+
**Status**: ✅ Complete and production-ready
