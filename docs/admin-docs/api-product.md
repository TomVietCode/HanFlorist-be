# Product API Endpoints

## 1. **Get Product List**

**API:** `[GET]: /admin/products`

### Tham số query:

| Tham số     | Mô tả                                               | Default Value |
| ----------- | --------------------------------------------------- | ------------- |
| `status`    | Filter products by status (e.g., active, inactive). | None          |
| `search`    | Search products by title (case insensitive).        | None          |
| `page`      | Page number for pagination.                         | 1             |
| `limit`     | Number of products per page.                        | 10            |
| `sortKey`   | Key to sort by (e.g., `createdAt`, `price`).        | `createdAt`   |
| `sortValue` | Sort direction: `asc` or `desc`.                    | `desc`        |

### Response:

**Status:** `200 OK`

```json
{
  "data": [
    ///Data here
  ],
  "paging": {
    // ...paging
  },
  "filter": {
    // query here
  }
}
```

**Status:** `500 Internal Server Error`

```json
{
  "message": "Lỗi khi gửi yêu cầu, vui lòng thử lại sau",
  "error": "string"
}
```

---

## 2. **Create Product**

**API:** `[POST] /admin/products`

### Request Body:

```json
{
  "title": "string",
  "price": "number",
  "thumbnail": "string",
  "stock": "number"
  //...
}
```

### Response:

**Status:** `201 Created`

```json
{
  "data": "id"
}
```

**Status:** `400 Bad Request`

```json
{
  "message": "Tạo mới sản phẩm thất bại",
  "errors": "string"
}
```

---

## 3. **Update Product**

**API:** `[PATCH] /admin/products/:id`

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
---

## 4. **Delete Product**

**API:** `[DELETE] /admin/products/:id`

### Request Body:

```json
{
  "isHard": Boolean
}
```

### Response:

**Status:** `200 OK`

```json
{
  "data": true
}
```

**Status:** `404 Not Found`

```json
{
  "message": "Không tìm thấy sản phẩm"
}
```

## 5. **Update Multiple Product**

**API:** `[PATCH] /admin/products/`

### Request Body:

```json
{
  "ids": //Products id array,
  "updates": {
    //Trường muốn cập nhật giá trị, ví dụ:
    "status": "inactive"
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
  "message": //error
}
```

---
