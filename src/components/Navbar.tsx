import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ShieldCheck, User as UserIcon, LogOut, LogIn, UserPlus, Package } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => onNavigate('products')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs group-hover:scale-105 transition">
              ▲
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-stone-900 leading-none">
                APEX
              </span>
              <span className="text-[10px] tracking-wider uppercase font-bold text-indigo-600 font-mono">
                Storefront
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden sm:flex items-center gap-5 text-xs font-semibold">
            <button
              onClick={() => onNavigate('products')}
              className={`transition ${currentView === 'products' ? 'text-indigo-600 font-bold' : 'text-stone-500 hover:text-stone-900'}`}
            >
              Shop Catalog
            </button>
            {isAuthenticated && (
              <button
                onClick={() => onNavigate('orders')}
                className={`transition ${currentView === 'orders' ? 'text-indigo-600 font-bold' : 'text-stone-500 hover:text-stone-900'}`}
              >
                My Orders
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                  currentView === 'admin'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          <button
            onClick={() => onNavigate('cart')}
            className={`relative p-2 rounded-lg border transition ${
              currentView === 'cart'
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'border-stone-200 hover:bg-stone-50 text-stone-700'
            }`}
            title="View Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Auth State */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-stone-900 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-mono text-indigo-600 font-semibold leading-tight">
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
              >
                <LogIn className="w-3.5 h-3.5 text-stone-400" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
