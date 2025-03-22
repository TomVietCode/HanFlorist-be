# API Endpoints Documentation

## 1. **User API**

### 1.1 Get User List
**API:** `[GET] /admin/users`
- Lấy danh sách người dùng.
- **Query Params:**
  - `role`: `admin` hoặc `client` (mặc định: `admin`).
  - `page`: số trang (mặc định: `1`).
  - `limit`: số lượng kết quả trên mỗi trang (mặc định: `10`).

### 1.2 Get User Profile
**API:** `[GET] /admin/users/profile`
- Lấy thông tin hồ sơ cá nhân của người dùng.

### 1.3 Update User Profile
**API:** `[PATCH] /admin/users/profile`
- Cập nhật thông tin hồ sơ cá nhân.
- **Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string"
}
```

### 1.4 Get User by ID
**API:** `[GET] /admin/users/:id`
- Lấy thông tin người dùng theo ID.

### 1.5 Create User
**API:** `[POST] /admin/users`
- Tạo tài khoản mới.
- **Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "roleId": "string"
}
```

### 1.6 Update User
**API:** `[PATCH] /admin/users/:id`
- Cập nhật thông tin người dùng.
- **Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "roleId": "string"
}
```

### 1.7 Delete User
**API:** `[DELETE] /admin/users/:id`
- Xóa người dùng theo ID.
- **Request Body:**
```json
{
  "isHard": "boolean" // true để xóa vĩnh viễn, false để đánh dấu đã xóa
}
```

---

