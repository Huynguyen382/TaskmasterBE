# Tài liệu API - Task Manager

Phiên bản: 1.0
Cơ sở URL: `http://localhost:<PORT>/api`

## Xác thực
- Sử dụng JWT Bearer Token
- Header: `Authorization: Bearer <token>`
- Các tuyến công khai: `POST /api/users/register`, `POST /api/users/login`
- Tất cả tuyến còn lại yêu cầu token hợp lệ

Mã lỗi chuẩn hóa (ví dụ):
- 400: Dữ liệu không hợp lệ
- 401: Thiếu/Token không hợp lệ, token hết hạn
- 403: Không đủ quyền truy cập
- 404: Không tìm thấy tài nguyên
- 409: Xung đột dữ liệu (trùng email/username)
- 500: Lỗi hệ thống

Cấu trúc phản hồi chuẩn:
```json
{
  "success": true | false,
  "message": "Mô tả ngắn",
  "data": { ... },
  "timestamp": "ISO string" // có thể xuất hiện trong handler lỗi
}
```

---

## Người dùng (`/api/users`)

### Đăng ký người dùng
- `POST /api/users/register`
- Body:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123",
  "firstName": "John",
  "lastName": "Doe"
}
```
- 201 Created
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "<id>",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user|admin|manager"
    },
    "token": "<jwt>"
  }
}
```

### Đăng nhập
- `POST /api/users/login`
- Body:
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```
- 200 OK: Trả về `user` và `token` (giống đăng ký)

### Lấy danh sách người dùng (chỉ admin)
- `GET /api/users`
- Header: `Authorization`
- 200 OK
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [ { "id": "<id>", "username": "...", "email": "...", "role": "..." } ]
}
```

### Xem thông tin người dùng theo id (chủ sở hữu hoặc admin)
- `GET /api/users/:id`
- Header: `Authorization`
- 200 OK: Trả về thông tin người dùng

### Cập nhật người dùng (chủ sở hữu hoặc admin)
- `PUT /api/users/:id`
- Header: `Authorization`
- Body (một phần):
```json
{
  "email": "new@example.com",
  "username": "newname",
  "password": "newSecret",
  "firstName": "New",
  "lastName": "Name"
}
```
- 200 OK: Trả về người dùng đã cập nhật

### Xóa người dùng (chỉ admin)
- `DELETE /api/users/:id`
- Header: `Authorization`
- 200 OK: `{ success: true, message: "User deleted successfully" }`

### Danh sách người dùng theo Task ID (đã xác thực)
- `GET /api/users/task/:taskId`
- Header: `Authorization`
- 200 OK
```json
{
  "success": true,
  "message": "Task users retrieved successfully",
  "data": {
    "taskId": "<taskId>",
    "taskTitle": "<title>",
    "users": [
      { "_id": "<userId>", "username": "...", "email": "...", "role": "member|manager" }
    ]
  }
}
```

---

## Công việc (`/api/tasks`)

Yêu cầu xác thực cho tất cả các tuyến.

### Lấy tất cả task của người dùng hiện tại
- `GET /api/tasks`
- Header: `Authorization`
- 200 OK: Danh sách task mà bạn tạo hoặc là thành viên

### Lấy task theo trạng thái
- `GET /api/tasks/status/:status`
- Header: `Authorization`
- 200 OK: Danh sách task có `status` và bạn có quyền truy cập

### Lấy task theo mức độ ưu tiên
- `GET /api/tasks/priority/:priority`
- Header: `Authorization`
- 200 OK: Danh sách task có `priority` và bạn có quyền truy cập

### Lấy chi tiết task theo id
- `GET /api/tasks/:id`
- Header: `Authorization`
- 200 OK: Chi tiết task nếu là người tạo hoặc thành viên

### Tạo task mới
- `POST /api/tasks`
- Header: `Authorization`
- Body (ví dụ):
```json
{
  "title": "Build landing page",
  "description": "Create hero, features, and footer sections",
  "status": "todo|in_progress|done",
  "priority": "low|medium|high",
  "dueDate": "2025-12-31T00:00:00.000Z",
  "member": [ { "userId": "<userId>", "role": "member|manager" } ]
}
```
- Lưu ý: Server tự động thêm người tạo vào `member` với `role = manager`
- 201 Created: Trả về task đã tạo

### Cập nhật task
- `PUT /api/tasks/:id`
- Header: `Authorization`
- Body (một phần):
```json
{ "title": "...", "status": "...", "priority": "...", "member": [ ... ] }
```
- Quyền: Người tạo hoặc thành viên có `role=manager`
- 200 OK: Trả về task sau cập nhật

### Xóa task
- `DELETE /api/tasks/:id`
- Header: `Authorization`
- Quyền: Chỉ người tạo task
- 200 OK: `{ success: true, message: "Task deleted successfully" }`

### Thêm thành viên vào task
- `POST /api/tasks/:id/members`
- Header: `Authorization`
- Body:
```json
{ "userId": "<userId>", "role": "member|manager" }
```
- Quyền: Người tạo hoặc `manager` trong task
- 200 OK: Trả về task sau khi thêm thành viên

### Xóa thành viên khỏi task
- `DELETE /api/tasks/:id/members`
- Header: `Authorization`
- Body:
```json
{ "userId": "<memberUserId>" }
```
- Quyền: Người tạo hoặc `manager` trong task; không thể xóa người tạo
- 200 OK: Trả về task sau khi xóa thành viên

---

## Ghi chú khác
- Base route:
  - `/api/users` ánh xạ `routes/users.js`
  - `/api/tasks` ánh xạ `routes/tasks.js`
- Socket.IO được cấu hình trong `app.js` (không có sự kiện nghiệp vụ đặc thù trong code này)
- Bảo mật: cần biến môi trường `JWT_SECRET` để xác thực hoạt động đúng
- Trong môi trường `development`, lỗi trả về kèm `stack` để debug
