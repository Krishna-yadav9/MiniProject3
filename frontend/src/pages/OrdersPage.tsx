import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { orderApi } from '../api/client';
import { Package, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';

interface OrdersPageProps {
  onNavigate: (view: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderApi.getUserOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn('Could not fetch user orders:', err);
      setError(err.message || 'Could not load your orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
            <Truck className="w-3 h-3" />
            <span>Shipped</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            <span>Processing</span>
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto my-8 space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-stone-200 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 my-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Your Order History</h1>
          <p className="text-xs text-stone-500">
            Orders persisted in Cloud Firestore and retrieved via Spring Boot REST
          </p>
        </div>
        <button
          onClick={() => onNavigate('products')}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          Continue Shopping
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-8 space-y-4 shadow-sm">
          <Package className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-900">No Orders Placed Yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            When you complete checkout, your order will be saved to Cloud Firestore and appear here.
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4 hover:border-indigo-200 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                <div className="space-y-0.5">
                  <div className="font-mono font-bold text-stone-900">
                    Order #{order.id}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recent'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <span className="font-black text-sm text-stone-900">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items in this order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {order.items.map(item => (
                  <div key={item.productId} className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-10 h-10 rounded-lg object-cover bg-stone-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1 text-xs">
                      <div className="font-bold text-stone-900 truncate">
                        {item.productName}
                      </div>
                      <div className="text-stone-500 text-[11px]">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Address */}
              <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-50 flex items-center justify-between">
                <span>Shipping Destination: <strong>{order.shippingAddress}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
