import React from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Package,
  Clock,
  CheckCircle,
  Truck,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

interface UserOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserOrdersModal: React.FC<UserOrdersModalProps> = ({
  isOpen,
  onClose
}) => {
  const { orders } = useStore();
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  // Filter orders placed by current user or show all if admin/demo
  const userOrders = orders.filter(
    o => o.userId === currentUser.id || o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              My Orders & Delivery Tracking ({userOrders.length})
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
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {userOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                No orders placed yet
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Any orders you complete will appear here with live tracking, delivery status, and order breakdown.
              </p>
            </div>
          ) : (
            userOrders.map(order => (
              <div
                key={order.id}
                className="bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/60 rounded-2xl p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200 dark:border-stone-700/80">
                  <div>
                    <div className="font-mono font-bold text-sm text-stone-900 dark:text-stone-100">
                      {order.orderNumber}
                    </div>
                    <div className="text-[11px] text-stone-400 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>{order.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${order.status === 'delivered' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : order.status === 'shipped' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'}`}
                    >
                      {order.status === 'delivered' && <CheckCircle className="w-3 h-3" />}
                      {order.status === 'shipped' && <Truck className="w-3 h-3" />}
                      {order.status === 'processing' && <Clock className="w-3 h-3" />}
                      {order.status}
                    </span>
                    <span className="font-mono font-black text-sm text-stone-900 dark:text-stone-100">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-9 h-9 rounded-lg object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                        />
                        <div className="truncate">
                          <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <span className="font-mono font-medium text-stone-800 dark:text-stone-200 shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
