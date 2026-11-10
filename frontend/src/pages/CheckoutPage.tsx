import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/client';
import { CreditCard, MapPin, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (view: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  const items = cart?.items || [];
  const total = cart?.totalAmount || 0;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !city.trim() || !postalCode.trim()) {
      setError('Please provide a complete shipping address');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const fullAddress = `${address.trim()}, ${city.trim()} ${postalCode.trim()}`;

    try {
      const order = await orderApi.create(fullAddress, paymentMethod);
      setPlacedOrder(order);
      await clearCart();
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="max-w-lg mx-auto my-12 text-center p-8 bg-white rounded-3xl border border-stone-200 shadow-xl space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-stone-900">Order Confirmed!</h2>
          <p className="text-xs text-stone-500">
            Thank you for your purchase. Your order was stored in Cloud Firestore via Spring Boot.
          </p>
        </div>

        <div className="bg-stone-50 rounded-2xl p-4 text-xs font-mono text-left space-y-1.5 border border-stone-200">
          <div className="flex justify-between">
            <span className="text-stone-500">Order ID:</span>
            <span className="font-bold text-stone-900">{placedOrder.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Total Charged:</span>
            <span className="font-bold text-indigo-600">${placedOrder.totalAmount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Status:</span>
            <span className="font-bold text-emerald-600">{placedOrder.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Shipping To:</span>
            <span className="font-medium text-stone-800 text-right truncate max-w-[200px]">
              {placedOrder.shippingAddress}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('products')}
            className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs transition"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => onNavigate('orders')}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-md"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 my-6">
      <button
        onClick={() => onNavigate('cart')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Cart</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-stone-900">Shipping Details</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="742 Evergreen Terrace"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Springfield"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    placeholder="97477"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-stone-900">Payment Simulation</h2>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 border border-indigo-500 bg-indigo-50/40 rounded-xl cursor-pointer text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'CREDIT_CARD'}
                    onChange={() => setPaymentMethod('CREDIT_CARD')}
                    className="text-indigo-600"
                  />
                  <span className="font-semibold text-stone-900">Instant Test Card</span>
                </div>
                <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded">
                  TEST ENVIRONMENT
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-xs shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Placing Order in Firestore...' : `Complete Order ($${total.toFixed(2)})`}
          </button>
        </form>

        {/* Order Items Review */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm h-fit space-y-4">
          <h2 className="text-sm font-bold text-stone-900 pb-3 border-b border-stone-100">
            Items in Order ({items.length})
          </h2>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {items.map(item => (
              <div key={item.productId} className="flex items-center gap-3 text-xs">
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-12 h-12 rounded-lg object-cover bg-stone-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-stone-900 truncate">
                    {item.productName}
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </div>
                </div>
                <div className="font-bold text-stone-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-200 flex justify-between font-bold text-sm">
            <span>Total</span>
            <span className="text-indigo-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
