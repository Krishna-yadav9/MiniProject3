# E-Commerce Backend (Spring Boot 3.x + Firebase Firestore)

Enterprise-grade Spring Boot 3.x REST API with Spring Security 6, JWT authentication, and Google Cloud Firestore database via Firebase Admin SDK.

## 🛠️ Tech Stack & Requirements
- **Java**: 17+
- **Spring Boot**: 3.2.4
- **Security**: Spring Security 6 with stateless JWT and BCrypt
- **Database**: Cloud Firestore (Firebase Admin SDK)
- **Build Tool**: Maven 3.8+

## 📁 Layered Architecture
```text
backend/src/main/java/com/ecommerce/
├── config/                  # SecurityConfig, JwtAuthenticationFilter, JwtTokenProvider, FirebaseConfig, CorsConfig
├── controller/              # AuthController, ProductController, CartController, OrderController
├── dto/                     # RegisterRequest, LoginRequest, AuthResponse, ProductDto, CartItemRequest, OrderRequest, ApiResponse
├── exception/               # GlobalExceptionHandler (@RestControllerAdvice), custom exceptions
├── model/                   # User, Product, Cart, CartItem, Order, Role
├── repository/              # UserRepository, ProductRepository, CartRepository, OrderRepository (Firestore async queries)
├── service/                 # AuthService, ProductService, CartService, OrderService
└── EcommerceApplication.java # Spring Boot entry point
```

## 🔐 REST API Endpoints

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` - Create user account (`ROLE_USER` or `ROLE_ADMIN`)
- `POST /api/auth/login` - Authenticate with email & password, returns JWT
- `GET /api/auth/me` - Retrieve current principal profile

### 2. Products (`/api/products`)
- `GET /api/products` - List products (optional `?category=Audio`) [Public]
- `GET /api/products/{id}` - Get product by ID [Public]
- `POST /api/products` - Create product [Admin only: `ROLE_ADMIN`]
- `PUT /api/products/{id}` - Update product [Admin only: `ROLE_ADMIN`]
- `DELETE /api/products/{id}` - Delete product [Admin only: `ROLE_ADMIN`]

### 3. Shopping Cart (`/api/cart`)
- `GET /api/cart` - Get authenticated user's cart [`ROLE_USER` or `ROLE_ADMIN`]
- `POST /api/cart` - Add item to cart [`ROLE_USER` or `ROLE_ADMIN`]
- `PUT /api/cart/{productId}?quantity=3` - Update item quantity
- `DELETE /api/cart/{productId}` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

### 4. Orders (`/api/orders`)
- `POST /api/orders` - Place order from current cart [`ROLE_USER` or `ROLE_ADMIN`]
- `GET /api/orders` - Get current user's order history
- `GET /api/orders/{id}` - Get order details (owner or admin)
- `GET /api/orders/all` - List all system orders [Admin only: `ROLE_ADMIN`]
- `PATCH /api/orders/{id}/status?status=SHIPPED` - Update order status [Admin only]

## 🚀 How to Run the Backend

### Prerequisites
Make sure Java 17 and Maven are installed:
```bash
java -version
mvn -version
```

### Configuration (Environment Variables)
Set secrets in your environment or leave defaults:
```bash
export JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
export FIREBASE_PROJECT_ID="tonal-arcade-t07pf"
# Optional: path to service-account JSON key if running outside GCP:
# export FIREBASE_SERVICE_ACCOUNT_PATH="/path/to/serviceAccountKey.json"
```

### Compile & Start
```bash
cd backend
mvn clean spring-boot:run
```
The server will start at `http://localhost:8080`.

### Default Credentials
- **Admin**: `admin@apexstore.com` / `Admin@2026!` (`ROLE_ADMIN`)
- **Customer**: Register via `/api/auth/register`
