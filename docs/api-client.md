# API Endpoints Documentation

## 1. **Authentication API**

### 1.1 Google Authentication
**API:** `[GET] /auth/google`
- Điều hướng đến trang đăng nhập Google.

**API:** `[GET] /auth/google/callback`
- Callback từ Google sau khi xác thực.
- **Response:**
```json
{
  "data": "token"
}
```

### 1.2 Signup
**API:** `[POST] /auth/signup`
- Đăng ký tài khoản mới.
- **Request Body:**
```json
{
  "email": "string",
  "username": "string",
  "password": "string",
  "name": "string"
}
```

### 1.3 Login
**API:** `[POST] /auth/login`
- Đăng nhập vào hệ thống.
- **Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

### 1.4 Forgot Password
**API:** `[POST] /auth/forgot-password`
- Gửi yêu cầu đặt lại mật khẩu.
- **Request Body:**
```json
{
  "email": "string"
}
```

### 1.5 OTP Password
**API:** `[POST] /auth/otp-password`
- Xác thực OTP để đặt lại mật khẩu.
- **Request Body:**
```json
{
  "email": "string",
  "otp": "string"
}
```

### 1.6 Reset Password
**API:** `[PATCH] /auth/reset-password`
- Đặt lại mật khẩu sau khi xác thực OTP.
- **Yêu cầu quyền:** `client`
- **Request Body:**
```json
{
  "newPassword": "string"
}
```

---
## 2. **Product API**

### 2.1 Get Product List
**API:** `[GET] /v1/products`
- Lấy danh sách sản phẩm.

### 2.2 Get Product Detail
**API:** `[GET] /v1/products/detail/:slug`
- Lấy thông tin chi tiết của sản phẩm theo `slug`.

### 2.3 Get Products by Category
**API:** `[GET] /v1/products/:slugCategory`
- Lấy danh sách sản phẩm theo danh mục `slugCategory`.

---
## 3. **User API**

### 3.1 Get User Profile
**API:** `[GET] /v1/users/profile`
- Lấy thông tin hồ sơ cá nhân của người dùng.

---
## 4. **Cart API**

### 4.1 Get Cart Items
**API:** `[GET] /v1/cart`
- Lấy danh sách sản phẩm trong giỏ hàng.

### 4.2 Add Product to Cart
**API:** `[POST] /v1/cart/add/:productId`
- Thêm sản phẩm vào giỏ hàng theo `productId`.
- **Request Body:**
```json
{
  "quantity": "number"
}
```

### 4.3 Delete Product from Cart
**API:** `[DELETE] /v1/cart/delete/:productId`
- Xóa sản phẩm khỏi giỏ hàng theo `productId`.

### 4.4 Update Product Quantity in Cart
**API:** `[PATCH] /v1/cart/update/:productId/:newQuantity`
- Cập nhật số lượng sản phẩm trong giỏ hàng.

---
## 5. **Search API**

### 5.1 Search Products
**API:** `[GET] /v1/search`
- Tìm kiếm sản phẩm trong hệ thống.

---
## 6. **Home API**

### 6.1 Get Homepage Data
**API:** `[GET] /v1/`
- Lấy dữ liệu trang chủ.

---

