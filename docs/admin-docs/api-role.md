# Role API Documentation

## 1. **Role API**

### 1.1 Get Role List

**API:** `[GET] /admin/roles`

- Lấy danh sách vai trò.
- **Response:**

```json
{
  "data": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "permissions": ["string"],
      "status": "active"
    }
  ]
}
```

### 1.2 Create Role

**API:** `[POST] /admin/roles/`

- Tạo vai trò mới.
- ***Request Body:***

```json
{
  "title": "string",
  "description": "string",
  "permissions": ["string"]
}
```

- **Response:**

```json
{
  "data": "role_id"
}
```

### 1.3 Update Role

**API:** `[PATCH] /admin/roles/:id`

- Cập nhật thông tin vai trò.
- **Request Body:**

```json
{
  "title": "string",
  "description": "string",
  "permissions": ["string"]
}
```

- **Response:**

```json
{
  "data": true
}
```

### 1.4 Delete Role

**API:** `[DELETE] /admin/roles/delete/:id`

- Xóa vai trò theo ID.
- **Response:**

```json
{
  "data": true
}
```

### 1.5 Get Role Permissions

**API:** `[GET] /admin/roles/permissions`

- Lấy danh sách quyền của các vai trò.
- **Response:**

```json
{
  "data": [
    {
      "_id": "string",
      "title": "string",
      "permissions": ["string"]
    }
  ]
}
```

### 1.6 Update Role Permissions

**API:** `[PATCH] /admin/roles/permissions`

- Cập nhật quyền cho vai trò.
- **Request Body:**

```json
[
  {
    "id": "string",
    "permissions": ["string"]
  }
]
```

- **Response:**

```json
{
  "data": true
}
```

## 2. **Danh sách quyền (Permissions List)**

| Mã | Quyền |
|----|------------------|
| 0  | category_read   |
| 2  | category_create |
| 3  | category_update |
| 4  | category_delete |
| 5  | product_read    |
| 6  | product_create  |
| 7  | product_update  |
| 8  | product_delete  |
| 9  | role_read       |
| 10 | role_create     |
| 11 | role_update     |
| 12 | role_permissions |
| 13 | role_delete     |
| 14 | user_read       |
| 15 | user_create     |
| 16 | user_update     |
| 18 | settings_read   |
| 19 | settings_update |

