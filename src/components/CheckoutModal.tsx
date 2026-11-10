import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import {
  X,
  CreditCard,
  CheckCircle,
  Truck,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Printer
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose
}) => {
  const { cart, placeOrder, config, coupon } = useStore();
  const { currentUser } = useAuth();

  const [fullName, setFullName] = useState(currentUser.name || 'Alex Morgan');
  const [street, setStreet] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('Springfield');
  const [state, setState] = useState('OR');
  const [zipCode, setZipCode] = useState('97477');
  const [country, setCountry] = useState('United States');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card (•••• 4242)');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = coupon ? (subtotal * coupon.discountPercent) / 100 : 0;
  const grandTotal = subtotal - discountAmount;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const order = placeOrder(
        {
          fullName,
          street,
          city,
          state,
          zipCode,
          country
        },
        paymentMethod
      );

      setIsProcessing(false);
      if (order) {
        setCompletedOrder(order);
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {completedOrder ? 'Order Confirmed & Invoiced' : 'Frictionless Express Checkout'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {completedOrder ? (
            /* Order Success View */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                  Payment Authorized
                </span>
                <h3 className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
                  Thank you for your order!
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Order confirmation <strong className="font-mono text-stone-900 dark:text-stone-100">{completedOrder.orderNumber}</strong> has been transmitted to <span className="underline">{completedOrder.customerEmail}</span>.
                </p>
              </div>

              {/* Order Receipt Box */}
              <div className="bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 rounded-2xl p-5 text-left text-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-stone-700 font-medium">
                  <span className="text-stone-500">Shipping To:</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{completedOrder.shippingAddress.fullName}</span>
                </div>

                <div className="text-stone-500 text-[11px] leading-relaxed">
                  {completedOrder.shippingAddress.street}, {completedOrder.shippingAddress.city}, {completedOrder.shippingAddress.state} {completedOrder.shippingAddress.zipCode}
                </div>

                <div className="pt-2 border-t border-stone-200 dark:border-stone-700 space-y-2">
                  {completedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 truncate max-w-[300px]">
                        <span className="font-bold font-mono">{item.quantity}x</span>
                        <span className="truncate">{item.title}</span>
                      </div>
                      <span className="font-mono font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex justify-between font-bold text-sm text-stone-900 dark:text-stone-100">
                  <span>Total Billed:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-black">
                    ${completedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              {/* Shipping Address */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span>Delivery Address</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={e => setStreet(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={e => setState(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        required
                        value={zipCode}
                        onChange={e => setZipCode(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Secure Payment</span>
                </h3>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 border border-stone-200 dark:border-stone-700 rounded-xl bg-stone-50/50 dark:bg-stone-800/40 cursor-pointer">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'Credit Card (•••• 4242)'}
                        onChange={() => setPaymentMethod('Credit Card (•••• 4242)')}
                        className="text-indigo-600"
                      />
                      <span>Credit Card (Visa / Mastercard / Amex)</span>
                    </div>
                    <span className="text-[11px] font-mono text-stone-400">•••• 4242</span>
                  </label>

                  <label className="flex items-center justify-between p-3 border border-stone-200 dark:border-stone-700 rounded-xl bg-stone-50/50 dark:bg-stone-800/40 cursor-pointer">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'Apple Pay'}
                        onChange={() => setPaymentMethod('Apple Pay')}
                        className="text-indigo-600"
                      />
                      <span>Apple Pay / Digital Wallet</span>
                    </div>
                    <span className="text-[11px] text-stone-400">Instant</span>
                  </label>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800 text-xs space-y-1.5">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal ({cart.length} line items)</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex justify-between font-bold text-sm text-stone-900 dark:text-stone-100">
                  <span>Total Charge</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-black">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Authorizing Secure Transaction...</span>
                ) : (
                  <>
                    <span>Authorize & Place Order • ${grandTotal.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
