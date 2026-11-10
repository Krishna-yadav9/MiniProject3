# E-Commerce Frontend (React + Vite + TypeScript)

Modern, high-performance E-Commerce storefront and administrative dashboard built with React 19, TypeScript, Vite, and Tailwind CSS.

## 🌟 Features
- **Strict Role-Based Routing**: Clean separation between Customer (`ROLE_USER`) and Admin (`ROLE_ADMIN`) features.
- **REST API Integration**: Direct stateless JWT communication with the Spring Boot backend (`/api/*`).
- **No Direct Firebase/Firestore in Frontend**: All data mutations, business rules, stock checks, and authentication are strictly handled server-side by the Spring Boot backend.
- **Pages**:
  - `ProductListPage`: Filter by category, real-time search, quick view modal, stock badges, add-to-cart.
  - `LoginPage` & `RegisterPage`: Clean JWT auth with role selection and 1-click test credential fill.
  - `CartPage`: Cart item quantity management, live calculation, clear cart, proceed to checkout.
  - `CheckoutPage`: Shipping address collection, payment method selector, order confirmation.
  - `OrdersPage`: Customer order timeline, live status tags, items summary.
  - `AdminDashboardPage`: Real-time inventory table, Create/Edit/Delete products modal, and Full Customer Orders oversight.

## 🛠️ Tech Stack & Requirements
- **Node.js**: 18+
- **Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite 6+
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

## 📁 Structure
```text
frontend/
├── src/
│   ├── api/             # client.ts (Type-safe Fetch client with JWT Bearer injection)
│   ├── components/      # Navbar, modals, badges, UI elements
│   ├── context/         # AuthContext (JWT + user state), CartContext (backend cart sync)
│   ├── pages/           # ProductListPage, LoginPage, RegisterPage, CartPage, CheckoutPage, OrdersPage, AdminDashboardPage
│   ├── types/           # Domain models matching Spring Boot DTOs
│   ├── App.tsx          # Role-guarded route controller
│   ├── main.tsx         # React root
│   └── index.css        # Tailwind CSS imports
├── index.html
├── vite.config.ts       # Vite proxy to Spring Boot at http://localhost:8080
├── tsconfig.json
└── package.json
```

## 🚀 How to Run the Frontend

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Backend API URL (Optional)
By default, Vite proxies requests from `/api` to `http://localhost:8080`.
If your backend is hosted at another address, configure `.env`:
```bash
VITE_BACKEND_URL=http://localhost:8080
```

### 3. Start Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000` (or `http://localhost:5173`).

### 4. Build for Production
```bash
npm run build
```
Static production files will be output to `frontend/dist/`.
