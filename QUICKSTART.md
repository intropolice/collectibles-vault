# Quick Start Guide

Get CollectiblesVault API running in 5 minutes!

## Prerequisites
- Python 3.9+
- PostgreSQL 12+

## 1. Clone Repository
```bash
cd collectibles-vault
```

## 2. Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

## 3. Install Dependencies
```bash
pip install -r requirements.txt
```

## 4. Setup Environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL connection details
```

## 5. Create PostgreSQL Database
```bash
# Option 1: Using psql command line
sudo -u postgres psql

CREATE USER collectibles_user WITH PASSWORD 'collectibles_pass';
CREATE DATABASE collectibles_vault OWNER collectibles_user;
GRANT ALL PRIVILEGES ON DATABASE collectibles_vault TO collectibles_user;
\q

# Option 2: Using one command
sudo -u postgres createuser -P collectibles_user
sudo -u postgres createdb -O collectibles_user collectibles_vault
```

## 6. Run Server
```bash
python main.py
```

Server will start at `http://localhost:8000`

## 7. Access API
- **API Docs (Swagger)**: http://localhost:8000/api/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/api/redoc

## Quick API Test

### 1. Register User
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Collector"
  }'
```

### 2. Login
```bash
curl -X POST "http://localhost:8000/auth/login?email=user@example.com&password=password123"
```

Copy the `access_token` from the response.

### 3. Create Collection
```bash
# Replace TOKEN with your access_token
curl -X POST "http://localhost:8000/collections" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Collection",
    "description": "A collection of vintage coins"
  }'
```

### 4. Create Item
```bash
# Replace TOKEN and COLLECTION_ID
curl -X POST "http://localhost:8000/items?collection_id=COLLECTION_ID" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gold Coin 1952",
    "item_type": "physical",
    "cost": 150.50,
    "acquisition_date": "2024-01-15T10:30:00",
    "item_id": "AU001",
    "weight": 31.5,
    "description": "Rare gold coin"
  }'
```

### 5. Get Collections
```bash
curl -X GET "http://localhost:8000/collections" \
  -H "Authorization: Bearer TOKEN"
```

## Troubleshooting

### PostgreSQL Connection Error
- Check `.env` DATABASE_URL is correct
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Test connection: `psql -U collectibles_user -d collectibles_vault`

### Port Already in Use
- Change port in command: `python main.py` or edit main.py
- Or kill existing process: `lsof -ti:8000 | xargs kill -9`

### Module Import Error
- Verify virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

## Next Steps

1. **Read Full Documentation**: See [README.md](README.md)
2. **Explore API Endpoints**: Visit http://localhost:8000/api/docs
3. **Create Collections**: Start tracking your items!
4. **Add Items**: Build your collection catalog
5. **Use Wishlists**: Track items you want to collect

## Common Commands

```bash
# Activate virtual environment
source venv/bin/activate

# Run server with auto-reload
uvicorn main:app --reload

# Deactivate virtual environment
deactivate

# View database
psql -U collectibles_user -d collectibles_vault

# Reset database (dangerous!)
sudo -u postgres dropdb collectibles_vault
sudo -u postgres createdb -O collectibles_user collectibles_vault
```

## Default Admin Access

When you deploy, an admin account is created with:
- Email: admin@collectibles.com (set in .env)
- Password: admin123 (set in .env)

Change these in production!

Happy collecting! 🎉
