import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';

interface CartPageProps {
  onNavigate: (view: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const items = cart?.items || [];
  const total = cart?.totalAmount || 0;

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 text-center p-8 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Your Cart is Empty</h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Explore our product catalog powered by Spring Boot & Cloud Firestore to add items to your cart.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Catalog</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 my-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-stone-500">
            {items.reduce((s, i) => s + i.quantity, 0)} items in your cart
          </p>
        </div>
        <button
          onClick={() => clearCart()}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div
              key={item.productId}
              className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex items-center gap-4 transition"
            >
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="w-18 h-18 rounded-xl object-cover bg-stone-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-stone-900 truncate">
                  {item.productName}
                </h3>
                <div className="text-xs text-indigo-600 font-bold mt-0.5">
                  ${item.price.toFixed(2)}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg p-1">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="p-1 text-stone-600 hover:bg-stone-200 rounded transition"
                  title="Decrease"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-xs font-mono font-bold text-stone-900">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="p-1 text-stone-600 hover:bg-stone-200 rounded transition"
                  title="Increase"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Item Total & Remove */}
              <div className="text-right pl-2">
                <div className="text-sm font-black text-stone-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-stone-400 hover:text-rose-600 p-1 transition"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm h-fit space-y-4">
          <h2 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
            Order Summary
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-900">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-emerald-600 uppercase font-mono">Free</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Sales Tax</span>
              <span className="font-semibold text-stone-900">$0.00</span>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
            <span className="font-bold text-stone-900">Total</span>
            <span className="text-xl font-black text-indigo-600">
              ${total.toFixed(2)}
            </span>
          </div>

          {isAuthenticated ? (
            <button
              onClick={() => onNavigate('checkout')}
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('login')}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Sign In to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-stone-400 text-center">
                Authentication required to persist orders to Firestore.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
