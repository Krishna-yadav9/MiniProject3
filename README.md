# ApexStore — Full-Stack E-Commerce System

Enterprise Full-Stack E-Commerce Platform built with a **Java 17 Spring Boot 3.x Backend** and a **React + TypeScript + Vite Frontend**, backed by **Google Cloud Firestore via Firebase Admin SDK**.

---

## 🏗️ Architecture Overview

The codebase is strictly decoupled into two standalone directories:

```text
.
├── backend/                  # Strictly Java 17 + Spring Boot 3.x + Maven
│   ├── src/main/java/com/ecommerce/
│   │   ├── config/           # Spring Security 6, JWT Filter, FirebaseConfig, CORS
│   │   ├── controller/       # AuthController, ProductController, CartController, OrderController
│   │   ├── dto/              # Request/Response payloads with jakarta.validation
│   │   ├── exception/        # GlobalExceptionHandler (@RestControllerAdvice)
│   │   ├── model/            # User, Product, Cart, CartItem, Order, Role
│   │   ├── repository/       # Firestore Async Repositories
│   │   └── service/          # AuthService, ProductService, CartService, OrderService
│   ├── src/main/resources/   # application.properties (env-driven secrets)
│   ├── pom.xml               # Spring Boot 3.2.4 & Firebase Admin SDK 9.2.0
│   └── README.md             # Backend setup & endpoint specifications
│
├── frontend/                 # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── api/              # HTTP client injecting Bearer JWT tokens
│   │   ├── components/       # UI components & Navigation
│   │   ├── context/          # AuthContext & CartContext
│   │   ├── pages/            # ProductListPage, LoginPage, RegisterPage, CartPage, CheckoutPage, OrdersPage, AdminDashboardPage
│   │   ├── types/            # TypeScript interfaces aligned with Backend DTOs
│   │   ├── App.tsx           # Role-based route protection
│   │   └── main.tsx
│   ├── vite.config.ts        # Vite proxy for /api -> http://localhost:8080
│   ├── package.json
│   └── README.md             # Frontend setup & features
│
└── README.md                 # Project root documentation
```

---

## 🔒 Security & Data Principles

1. **Spring Security 6 with Stateless JWT**:
   - Every request to `/api/products` (write ops), `/api/cart/**`, and `/api/orders/**` is authenticated via `JwtAuthenticationFilter`.
   - Passwords hashed using BCrypt.
   - Role-based authorization enforced via `@PreAuthorize("hasRole('ADMIN')")` and `ROLE_USER`.
2. **Database Access Restriction**:
   - **Cloud Firestore is ONLY accessed by the Spring Boot Backend** via the Firebase Admin SDK.
   - The frontend NEVER communicates directly with Firestore and contains zero Firebase client credentials or database rules.
3. **No Fake Simulation**:
   - Authentication tokens, role claims, cart persistence, and order processing are executed on the Spring Boot server.

---

## ⚡ Quick Start Guide

### 1. Start Backend (Terminal 1)
```bash
cd backend
mvn clean spring-boot:run
```
> Server runs at `http://localhost:8080`.
> Initial Admin account automatically initialized: `admin@apexstore.com` / `Admin@2026!`.

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
> Frontend runs at `http://localhost:3000` (or `http://localhost:5173`) with Vite proxying `/api` calls to `http://localhost:8080`.

---

## 📋 Preconfigured Accounts
| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@apexstore.com` | `Admin@2026!` | Catalog CRUD, View All System Orders, Inventory Control |
| **Customer** | Self-register on `/register` | Custom | Browse Catalog, Manage Cart, Checkout, Order History |
