import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { ProductListPage } from './pages/ProductListPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function StorefrontApp() {
  const [currentView, setCurrentView] = useState<string>('products');
  const { isAuthenticated, isAdmin } = useAuth();

  const handleNavigate = (view: string) => {
    // Role & Auth protection checks
    if ((view === 'checkout' || view === 'orders') && !isAuthenticated) {
      setCurrentView('login');
      return;
    }
    if (view === 'admin' && !isAdmin) {
      setCurrentView('admin'); // Will render the 403 Forbidden barrier
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {currentView === 'products' && <ProductListPage />}
        {currentView === 'login' && <LoginPage onNavigate={handleNavigate} />}
        {currentView === 'register' && <RegisterPage onNavigate={handleNavigate} />}
        {currentView === 'cart' && <CartPage onNavigate={handleNavigate} />}
        {currentView === 'checkout' && <CheckoutPage onNavigate={handleNavigate} />}
        {currentView === 'orders' && <OrdersPage onNavigate={handleNavigate} />}
        {currentView === 'admin' && <AdminDashboardPage onNavigate={handleNavigate} />}
      </main>

      <footer className="bg-white border-t border-stone-200 py-8 text-xs text-stone-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-stone-900 tracking-tight">APEX COMMERCE</span>
            <span>—</span>
            <span>Full-Stack Spring Boot 3 + React + Firestore</span>
          </div>
          <div className="flex items-center gap-4 text-stone-400 font-mono text-[11px]">
            <span>Spring Security 6</span>
            <span>•</span>
            <span>Firebase Admin SDK</span>
            <span>•</span>
            <span>REST API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StorefrontApp />
      </CartProvider>
    </AuthProvider>
  );
}
