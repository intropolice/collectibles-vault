# CollectiblesVault API Usage Examples

## Complete Workflow Example

This guide demonstrates a complete workflow of using the CollectiblesVault API.

### 1. User Registration & Authentication

#### Register a New User
```json
POST /auth/register
Content-Type: application/json

{
  "email": "collector@example.com",
  "password": "SecurePassword123!",
  "first_name": "Jane",
  "last_name": "Smith"
}

Response (201 Created):
{
  "id": 1,
  "email": "collector@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "created_at": "2024-03-05T09:22:00",
  "updated_at": "2024-03-05T09:22:00"
}
```

#### Login to Get Token
```json
POST /auth/login?email=collector@example.com&password=SecurePassword123!

Response (200 OK):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": 1
}
```

#### Get Current User Profile with Stats
```json
GET /auth/me
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response (200 OK):
{
  "id": 1,
  "email": "collector@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "created_at": "2024-03-05T09:22:00",
  "updated_at": "2024-03-05T09:22:00",
  "total_collections": 2,
  "total_items": 15,
  "total_collection_value": 5250.75
}
```

### 2. Create and Manage Collections

#### Create a New Collection
```json
POST /collections
Headers:
  Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Vintage Coins Collection",
  "description": "A collection of rare and valuable coins from around the world, primarily from the 19th and 20th centuries"
}

Response (201 Created):
{
  "id": 1,
  "user_id": 1,
  "name": "Vintage Coins Collection",
  "description": "A collection of rare and valuable coins from around the world...",
  "created_at": "2024-03-05T09:22:00",
  "updated_at": "2024-03-05T09:22:00",
  "items": [],
  "folders": []
}
```

#### Get All User Collections
```json
GET /collections
Headers:
  Authorization: Bearer {token}

Response (200 OK):
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Vintage Coins Collection",
    "description": "A collection of rare and valuable coins...",
    "created_at": "2024-03-05T09:22:00",
    "updated_at": "2024-03-05T09:22:00",
    "items": [...],
    "folders": [...]
  },
  {
    "id": 2,
    "user_id": 1,
    "name": "Art Prints",
    "description": "Digital art and limited edition prints",
    "created_at": "2024-03-05T10:00:00",
    "updated_at": "2024-03-05T10:00:00",
    "items": [...],
    "folders": [...]
  }
]
```

#### Get Collection Statistics
```json
GET /collections/1/stats
Headers:
  Authorization: Bearer {token}

Response (200 OK):
{
  "total_items": 8,
  "total_value": 3250.50,
  "most_expensive_item": "1902 Gold Sovereign",
  "items_by_type": {
    "physical": 7,
    "informational": 1,
    "nft": 0
  }
}
```

### 3. Create Folders Within Collections

#### Create Folder
```json
POST /folders?collection_id=1
Headers:
  Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "European Coins",
  "description": "Coins from European countries"
}

Response (201 Created):
{
  "id": 1,
  "collection_id": 1,
  "name": "European Coins",
  "description": "Coins from European countries",
  "created_at": "2024-03-05T09:25:00",
  "items": []
}
```

#### Get Collection Folders
```json
GET /folders/collection/1
Headers:
  Authorization: Bearer {token}

Response (200 OK):
[
  {
    "id": 1,
    "collection_id": 1,
    "name": "European Coins",
    "description": "Coins from European countries",
    "created_at": "2024-03-05T09:25:00",
    "items": [...]
  }
]
```

### 4. Add Items to Collection

#### Create Physical Item
```json
POST /items?collection_id=1
Headers:
  Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "1902 Gold Sovereign",
  "description": "Rare British gold coin, excellent condition",
  "item_type": "physical",
  "cost": 850.00,
  "acquisition_date": "2023-06-15T14:30:00",
  "item_id": "AU001",
  "weight": 7.988,
  "author": null,
  "nft_id": null,
  "image_url": "https://example.com/images/sovereign.jpg",
  "custom_fields_data": {
    "rarity": "Very Rare",
    "production_year": "1902",
    "condition_grade": "MS-65"
  }
}

Response (201 Created):
{
  "id": 1,
  "collection_id": 1,
  "folder_id": null,
  "name": "1902 Gold Sovereign",
  "description": "Rare British gold coin, excellent condition",
  "item_type": "physical",
  "cost": 850.00,
  "acquisition_date": "2023-06-15T14:30:00",
  "item_id": "AU001",
  "weight": 7.988,
  "author": null,
  "nft_id": null,
  "image_url": "https://example.com/images/sovereign.jpg",
  "secondary_image_url": null,
  "sort_order": 0,
  "custom_fields_data": {
    "rarity": "Very Rare",
    "production_year": "1902",
    "condition_grade": "MS-65"
  },
  "created_at": "2024-03-05T09:30:00",
  "updated_at": "2024-03-05T09:30:00",
  "tags": []
}
```

#### Create NFT Item (with dual images)
```json
POST /items?collection_id=2
Headers:
  Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "NFT Digital Art #123",
  "description": "Limited edition digital collectible",
  "item_type": "nft",
  "cost": 500.00,
  "acquisition_date": "2024-01-10T08:00:00",
  "item_id": "NF0001",
  "weight": null,
  "author": "ArtistName",
  "nft_id": "0x12a3f5b8c7d9e2f4a6b8c0d2e4f6a8b0",
  "image_url": "https://ipfs.example.com/front.jpg",
  "secondary_image_url": "https://ipfs.example.com/back.jpg",
  "custom_fields_data": {
    "blockchain": "Ethereum",
    "contract_address": "0xabcd...",
    "edition": "1/100"
  }
}

Response (201 Created):
{
  "id": 2,
  "collection_id": 2,
  "name": "NFT Digital Art #123",
  "item_type": "nft",
  "cost": 500.00,
  ...
}
```

### 5. Tag Items

#### Create Tags
```json
POST /tags
Headers:
  Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Rare"
}

Response (201 Created):
{
  "id": 1,
  "name": "Rare"
}
```

#### Add Tags to Item
```json
PUT /items/1
Headers:
  Authorization: Bearer {token}
Content-Type: application/json

{
  "tag_ids": [1, 2, 3]
}

Response (200 OK):
{
  "id": 1,
  "name": "1902 Gold Sovereign",
  "tags": [
    {"id": 1, "name": "Rare"},
    {"id": 2, "name": "Vintage"},
    {"id": 3, "name": "Gold"}
  ],
  ...
}
```

### 6. Filter and Sort Items

#### Filter by Price Range
```json
GET /items/collection/1?min_price=500&max_price=1500
Headers:
  Authorization: Bearer {token}

Response (200 OK):
[
  {
    "id": 1,
    "name": "1902 Gold Sovereign",
    "cost": 850.00,
    ...
  },
  {
    "id": 3,
    "name": "1920 French Franc",
    "cost": 1200.00,
    ...
  }
]
```

#### Filter by Type and Sort by Cost (Descending)
```json
GET /items/collection/1?item_type=physical&sort_by=cost&sort_order=desc
Headers:
  Authorization: Bearer {token}

Response (200 OK):
[Items sorted by cost, highest first]
```

#### Filter by Multiple Tags
```json
GET /items/collection/1?tag_ids=1&tag_ids=2&sort_by=name
Headers:
  Authorization: Bearer {token}

Response (200 OK):
[Items with both tags 1 and 2, sorted alphabetically]
```

#### Filter Physical Items by Weight
```json
GET /items/collection/1?item_type=physical&min_weight=5&max_weight=10
Headers:
  Authorization: Bearer {token}

Response (200 OK):
[Physical items between 5 and 10 units weight]
```

### 7. Move Item to Folder
```json
POST /items/1/move-to-folder?folder_id=1
Headers:
  Authorization: Bearer {token}

Response (200 OK):
{
  "message": "Item moved successfully",
  "item": {
    "id": 1,
    "folder_id": 1,
    ...
  }
}
```

### 8. Reorder Items (Drag & Drop)
```json
POST /items/1/reorder?collection_id=1
Headers:
  Authorization: Bearer {token}
Content-Type: application/json

{
  "1": 0,
  "2": 1,
  "3": 2,
  "4": 3
}

Response (200 OK):
{
  "message": "Items reordered successfully"
}
```

### 9. Create Wishlist Items

#### Add to Wishlist
```json
POST /wishlists
Headers:
  Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Rare 1889 Morgan Dollar",
  "description": "Looking for this specific variant",
  "target_price": 2500.00,
  "image_url": "https://example.com/morgan_dollar.jpg"
}

Response (201 Created):
{
  "id": 1,
  "user_id": 1,
  "name": "Rare 1889 Morgan Dollar",
  "description": "Looking for this specific variant",
  "target_price": 2500.00,
  "image_url": "https://example.com/morgan_dollar.jpg",
  "creation_date": "2024-03-05T09:35:00"
}
```

#### Get Wishlist
```json
GET /wishlists
Headers:
  Authorization: Bearer {token}

Response (200 OK):
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Rare 1889 Morgan Dollar",
    "target_price": 2500.00,
    "image_url": "https://example.com/morgan_dollar.jpg",
    "creation_date": "2024-03-05T09:35:00"
  }
]
```

### 10. Export to PDF

#### Export Single Collection
```json
POST /export/pdf-collection/1?include_images=true&include_custom_fields=true
Headers:
  Authorization: Bearer {token}

Response (200 OK):
[PDF file downloaded]
```

#### Export All Collections
```json
POST /export/pdf-all-collections?include_images=true&include_custom_fields=true
Headers:
  Authorization: Bearer {token}

Response (200 OK):
[PDF file with all collections downloaded]
```

### 11. Admin Functions

#### Get System Statistics
```json
GET /admin/statistics
Headers:
  Authorization: Bearer {admin_token}

Response (200 OK):
{
  "total_users": 45,
  "total_collections": 128,
  "total_items": 2847,
  "total_value": 125430.50,
  "last_updated": "2024-03-05T12:00:00"
}
```

#### Get Admin Dashboard
```json
GET /admin/dashboard
Headers:
  Authorization: Bearer {admin_token}

Response (200 OK):
{
  "statistics": {
    "total_users": 45,
    "total_collections": 128,
    "total_items": 2847,
    "total_value": 125430.50,
    "last_updated": "2024-03-05T12:00:00"
  },
  "top_collections": [
    {
      "collection_id": 5,
      "collection_name": "Rare Stamps",
      "item_count": 342,
      "total_value": 15230.75
    }
  ],
  "recent_collections": [...]
}
```

#### Get All Users
```json
GET /admin/users?skip=0&limit=50
Headers:
  Authorization: Bearer {admin_token}

Response (200 OK):
[
  {
    "id": 1,
    "email": "collector@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "created_at": "2024-03-05T09:22:00",
    "collection_count": 2,
    "item_count": 15,
    "total_value": 5250.75
  }
]
```

## Error Response Examples

### 400 Bad Request
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "cost"],
      "msg": "ensure this value is greater than 0",
      "input": -100
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Collection not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Database error occurred"
}
```

## Best Practices

1. **Store tokens securely** - Never expose in logs or version control
2. **Use HTTPS** - Always use HTTPS in production
3. **Validate inputs** - The API validates, but validate on client too
4. **Handle pagination** - Use skip/limit for large result sets
5. **Cache responses** - Cache collection lists for better performance
6. **Batch operations** - Use bulk operations when possible
7. **Error handling** - Always handle error responses properly
8. **Rate limiting** - Implement on client-side to avoid hitting limits

## Testing with cURL

All the examples above use JSON format suitable for cURL:

```bash
# Example cURL request
curl -X POST "http://localhost:8000/auth/login?email=collector@example.com&password=SecurePassword123!" \
  -H "Content-Type: application/json"

# With token
curl -X GET "http://localhost:8000/collections" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Testing with Postman

1. Import the OpenAPI schema from `/api/openapi.json`
2. Set up environment variables for `base_url` and `bearer_token`
3. Use pre-request scripts to refresh tokens
4. Test all endpoints with various filters and parameters

Enjoy using CollectiblesVault API! 🎉
