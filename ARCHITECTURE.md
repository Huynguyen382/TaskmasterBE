# Cấu trúc Backend Hiện đại - Task Manager API

## Tổng quan
Dự án này được thiết kế theo mô hình **Clean Architecture** với cấu trúc phân lớp rõ ràng, tuân theo các nguyên tắc SOLID và best practices của Node.js/Express.

## Cấu trúc thư mục

```
be/
├── config/                 # Cấu hình ứng dụng
│   └── database.js         # Kết nối MongoDB
├── controller/             # Controllers - xử lý HTTP requests
│   ├── userController.js
│   └── taskController.js
├── dto/                    # Data Transfer Objects - validation
│   ├── userDto.js
│   └── taskDto.js
├── middleware/             # Middleware functions
│   ├── auth.js            # Authentication
│   └── authorize.js       # Authorization
├── models/                 # Mongoose models - database schema
│   ├── User.js
│   └── Task.js
├── repositories/           # Repository pattern - data access layer
│   ├── userRepository.js
│   └── taskRepository.js
├── routes/                 # Express routes
│   ├── users.js
│   └── tasks.js
├── services/               # Business logic layer
│   ├── userService.js
│   └── taskService.js
├── utils/                  # Utility functions
│   ├── errors.js          # Custom error classes
│   └── response.js        # Standardized API responses
├── app.js                  # Express app configuration
└── server.js              # Server entry point
```

## Kiến trúc phân lớp

### 1. **Controller Layer** (Lớp điều khiển)
- **Trách nhiệm**: Xử lý HTTP requests/responses, validation cơ bản
- **Không chứa**: Business logic, database queries
- **Ví dụ**: `userController.js`

```javascript
exports.registerUser = async (req, res, next) => {
    try {
        const data = await userService.register(req.body);
        return ApiResponse.created(res, data, 'User registered successfully');
    } catch (error) {
        // Error handling
    }
};
```

### 2. **Service Layer** (Lớp dịch vụ)
- **Trách nhiệm**: Business logic, orchestration, validation phức tạp
- **Không chứa**: HTTP handling, direct database queries
- **Ví dụ**: `userService.js`

```javascript
async register(userData) {
    const userDto = new UserRegisterDto(userData);
    const { username, email, password } = userDto.toObject();
    
    // Business logic: check duplicates, hash password, etc.
    const existingUser = await userRepository.checkEmailExists(email);
    if (existingUser) {
        throw new ConflictError('User already exists');
    }
    
    return await userRepository.create(userData);
}
```

### 3. **Repository Layer** (Lớp kho dữ liệu)
- **Trách nhiệm**: Data access, database queries, caching
- **Không chứa**: Business logic
- **Ví dụ**: `userRepository.js`

```javascript
async create(userData) {
    const user = new User(userData);
    return await user.save();
}

async findByEmail(email) {
    return await User.findOne({ email });
}
```

### 4. **DTO Layer** (Data Transfer Objects)
- **Trách nhiệm**: Input validation, data sanitization
- **Ví dụ**: `userDto.js`

```javascript
class UserRegisterDto {
    constructor(data) {
        this.username = data.username?.trim();
        this.email = data.email?.trim()?.toLowerCase();
        this.validate();
    }
    
    validate() {
        // Validation logic
    }
}
```

### 5. **Model Layer** (Lớp mô hình)
- **Trách nhiệm**: Database schema, model methods
- **Ví dụ**: `User.js`

```javascript
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true }
});
```

## Các nguyên tắc được áp dụng

### 1. **Separation of Concerns**
- Mỗi lớp có trách nhiệm riêng biệt
- Controller chỉ xử lý HTTP, Service chỉ chứa business logic
- Repository chỉ truy cập database

### 2. **Dependency Injection**
- Service inject Repository
- Controller inject Service
- Dễ dàng test và mock

### 3. **Error Handling**
- Custom error classes với status codes cụ thể
- Global error handler
- Consistent error responses

### 4. **Validation**
- Input validation tại DTO layer
- Business validation tại Service layer
- Database validation tại Model layer

### 5. **Security**
- JWT authentication
- Role-based authorization
- Input sanitization

## Lợi ích của cấu trúc này

### ✅ **Maintainability** (Dễ bảo trì)
- Code được tổ chức rõ ràng theo chức năng
- Dễ dàng tìm và sửa lỗi
- Thêm tính năng mới không ảnh hưởng code cũ

### ✅ **Testability** (Dễ test)
- Mỗi lớp có thể test độc lập
- Mock dependencies dễ dàng
- Unit test và integration test rõ ràng

### ✅ **Scalability** (Khả năng mở rộng)
- Thêm tính năng mới theo pattern có sẵn
- Horizontal scaling với microservices
- Database có thể thay đổi mà không ảnh hưởng business logic

### ✅ **Reusability** (Tái sử dụng)
- Service có thể được sử dụng bởi nhiều controller
- Repository có thể được sử dụng bởi nhiều service
- DTO có thể được sử dụng cho nhiều endpoint

### ✅ **Security** (Bảo mật)
- Authentication/Authorization tách biệt
- Input validation nhiều lớp
- Error handling không expose sensitive data

## API Response Format

Tất cả API responses đều tuân theo format chuẩn:

### Success Response
```json
{
    "success": true,
    "message": "Operation successful",
    "data": {...},
    "timestamp": "2023-12-01T10:00:00.000Z"
}
```

### Error Response
```json
{
    "success": false,
    "message": "Error description",
    "timestamp": "2023-12-01T10:00:00.000Z"
}
```

## Middleware Stack

1. **CORS** - Cross-origin resource sharing
2. **Body Parser** - Parse JSON/URL-encoded data
3. **Morgan** - HTTP request logger (development)
4. **Authentication** - JWT verification
5. **Authorization** - Role-based access control
6. **Error Handler** - Global error handling

## Best Practices được áp dụng

1. **Async/Await** thay vì callbacks
2. **Error-first approach** với try-catch
3. **Environment variables** cho configuration
4. **Consistent naming conventions**
5. **JSDoc comments** cho documentation
6. **Validation** ở nhiều lớp
7. **Security headers** và input sanitization
8. **Logging** và monitoring
9. **Database indexing** cho performance
10. **Connection pooling** cho database

## Kết luận

Cấu trúc này đảm bảo:
- **Clean Code**: Dễ đọc, dễ hiểu
- **SOLID Principles**: Single Responsibility, Open/Closed, etc.
- **Design Patterns**: Repository, DTO, Factory
- **Enterprise Ready**: Scalable, maintainable, secure
- **Modern Node.js**: Best practices và conventions mới nhất
