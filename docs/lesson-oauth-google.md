# Authentication Flow
``` mermaid
  sequenceDiagram
      participant User as Người dùng
      participant Frontend as ReactJS (Frontend)
      participant Backend as ExpressJS (Backend)
      participant Google as Google OAuth
      participant DB as MongoDB

      User ->> Frontend: Mở trang Login
      User ->> Frontend: Nhấn Login với Google
      Frontend ->> Backend: Gửi request /auth/google
      Backend ->> Google: Chuyển hướng đến Google OAuth
      Google ->> User: Hiển thị trang đăng nhập Google
      User ->> Google: Nhập thông tin đăng nhập
      Google ->> Backend: Gửi mã xác thực (auth code)
      Backend ->> Google: Trao đổi mã lấy Access Token
      Google ->> Backend: Trả về Access Token + User Info
      Backend ->> DB: Kiểm tra User trong MongoDB
      DB -->> Backend: Trả về thông tin User (nếu có)
      
      alt User chưa tồn tại
          Backend ->> DB: Tạo tài khoản mới
          DB -->> Backend: Lưu User thành công
      end

      Backend ->> Backend: Tạo JWT Token
      Backend ->> Frontend: Gửi JWT Token về Frontend
      Frontend ->> Frontend: Lưu JWT vào localStorage
      Frontend ->> Backend: Gửi Token để xác thực
      Backend ->> DB: Lấy thông tin User từ Token
      DB -->> Backend: Trả về dữ liệu User
      Backend ->> Frontend: Gửi thông tin User
      Frontend ->> User: Chuyển hướng đến Dashboard

      User ->> Frontend: Nhấn Logout
      Frontend ->> Frontend: Xóa JWT từ localStorage
      Frontend ->> User: Chuyển về trang Login
```