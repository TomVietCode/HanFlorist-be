# Category API Endpoints Documentation

## 1. **Get Category List**

**API:** `[GET]: /admin/categories`

### Query Parameters:

| Parameter  | Description | Default Value |
|------------|-------------|---------------|
| `status`   | Filter categories by status (e.g., active, inactive). | None |
| `search`   | Search categories by title (case insensitive). | None |
| `sortKey`  | Key to sort by (e.g., `createdAt`, `name`). | `createdAt` |
| `sortValue`| Sorting order (`asc` or `desc`). | `desc` |

### Response:

**Status:** `200 OK`
```json
{
  "data": [
    // List of category data with creator and updater information
  ],
  "message": "Success"
}
```

**Status:** `500 Internal Server Error`
```json
{
  "message": "Lỗi khi gửi yêu cầu, vui lòng thử lại sau"
}
```

---

## 2. **Create Category**

**API:** `[POST]: /admin/categories`

### Request Body:
```json
{
  "title": "string",
  "parentId": "string (optional)",
  "status": "string",
  "createdBy": "string",
  "updatedBy": "string"
}
```

### Response:

**Status:** `201 Created`
```json
{
  "data": "category_id"
}
```

**Status:** `400 Bad Request`
```json
{
  "message": "Tạo mới danh mục thất bại",
  "errors": "string"
}
```

---

## 3. **Get Category by ID**

**API:** `[GET] /admin/categories/:id`

### Response:

**Status:** `200 OK`
```json
{
  "data": {
    "_id": "string",
    "title": "string",
    "status": "string",
    "createdBy": "string",
    "updatedBy": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Status:** `400 Bad Request` (Invalid ID)
```json
{
  "message": "Category not found (Invalid Id)"
}
```

---

## 3. **Update Category by ID**

**API:** `[PATCH]: /admin/categories/:id`

### Request Body:
```json
{
  "title": "string",
  // Fields need to update
}
```

### Response:

**Status:** `200 OK`
```json
{
  "data": true
}
```

**Status:** `400 Bad Request`
```json
{
  "message": "Category not found (Invalid Id)"
}
```

---

## 4. **Delete Category**

**API:** `[DELETE] /admin/categories/:id`

### Request Body:
```json
{
  "hardDelete": "boolean" // true: permanently delete, false: mark as deleted
}
```

### Response:

**Status:** `200 OK`
```json
{
  "data": true
}
```

**Status:** `400 Bad Request` (Invalid ID)
```json
{
  "message": "Category not found (Invalid Id)"
}
```

---

## 5. **Update Multiple Categories**

**API:** `[PATCH] /admin/categories/`

### Request Body:
```json
{
  "ids": ["string"], // List of Category IDs to update
  "updates": {
    // Fields to be updated
  }
}
```

### Response:

**Status:** `200 OK`
```json
{
  "data": true
}
```

**Status:** `400 Bad Request`
```json
{
  "message": "Invalid ID format",
  "errors": "string"
}
```

