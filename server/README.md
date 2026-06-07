# FBU Project – Backend (MongoDB)

## Yêu cầu

- Node.js 18+
- MongoDB đang chạy (local hoặc Atlas)

Nếu chưa có Node.js hoặc MongoDB trên máy, dùng Docker theo phần bên dưới.

## Chạy bằng Docker

Từ thư mục gốc của project:

```bash
docker compose up --build
```

Mở trình duyệt: **http://localhost:3000/html/login.html**

Nạp dữ liệu mẫu:

```bash
docker compose run --rm seed
```

Sau khi seed, đăng nhập admin:

```text
admin@fbu.edu.vn / Admin@2025
```

Dừng app:

```bash
docker compose down
```

Xóa luôn dữ liệu MongoDB đã lưu trong Docker volume:

```bash
docker compose down -v
```

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
