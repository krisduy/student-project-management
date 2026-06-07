# FBU Project – Backend (MongoDB)

## Yêu cầu

- Node.js 18+
- MongoDB đang chạy (local hoặc Atlas)

## Cài đặt

```bash
cd server
npm install
copy .env.example .env
```

Chỉnh `MONGODB_URI` và `JWT_SECRET` trong file `.env`.

## Nạp dữ liệu mẫu

```bash
npm run seed
```

## Chạy server

```bash
npm start
```

Mở trình duyệt: **http://localhost:3000/html/login.html**

Sau `npm run seed`, dùng email/mật khẩu đã tạo trong MongoDB (hoặc tài khoản Admin tạo tại trang **Tài Khoản**).

## Phân quyền

- **Đăng nhập**: API đọc `role` từ MongoDB → chuyển đúng cổng (admin / teacher / student).
- **Tạo tài khoản**: Chỉ Admin (`/api/users`, trang `accounts.html`).
- **Dữ liệu đồ án**: Mỗi role chỉ nhận dữ liệu phù hợp qua `/api/data/bootstrap`.
