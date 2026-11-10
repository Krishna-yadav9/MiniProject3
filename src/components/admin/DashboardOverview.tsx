import React from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertCircle,
  ShoppingBag,
  Users,
  ArrowRight,
  RotateCcw,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigateTab: (tab: 'inventory' | 'analytics' | 'roles' | 'config') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigateTab }) => {
  const { products, orders, inventoryStats, quickAdjustStock, restockAllLowStock, getCategoryBreakdown } = useStore();
  const { currentUser } = useAuth();

  const lowStockProducts = products.filter(
    p => p.stock <= (p.lowStockThreshold || 8)
  ).slice(0, 5);

  const categories = getCategoryBreakdown().slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Overview
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time status of inventory levels, order throughput, and revenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('inventory')}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" />
            <span>Manage Inventory</span>
          </button>
          <button
            onClick={() => onNavigateTab('analytics')}
            className="px-3.5 py-2 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 text-stone-700 dark:text-stone-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sales Analytics</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Catalog SKUs */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 hover:border-indigo-400 dark:hover:border-indigo-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Active Catalog
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-2">
            {inventoryStats.totalProducts} Products
          </div>
          <div className="flex items-center justify-between text-xs text-stone-500 mt-1">
            <span>{inventoryStats.totalStockUnits.toLocaleString()} total units</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Inventory Valuation */}
        <div
          onClick={() => onNavigateTab('analytics')}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 hover:border-emerald-400 dark:hover:border-emerald-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Retail Valuation
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-2">
            ${(inventoryStats.totalRetailValue / 1000).toFixed(1)}k
          </div>
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            <span>${(inventoryStats.potentialProfit / 1000).toFixed(1)}k profit potential</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Low Stock Attention */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 hover:border-amber-400 dark:hover:border-amber-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Restock Reorders
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {inventoryStats.lowStockCount} Low Items
          </div>
          <div className="flex items-center justify-between text-xs text-stone-500 mt-1">
            <span>{inventoryStats.outOfStockCount} out of stock</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Orders Processed */}
        <div
          onClick={() => onNavigateTab('analytics')}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 hover:border-purple-400 dark:hover:border-purple-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Orders Queue
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-2">
            {orders.length} Logged
          </div>
          <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
            <span>{orders.length === 0 ? 'Awaiting customer orders' : '100% fulfillment rate'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>

      {/* Main Grid: Urgent Stock Adjuster & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Inventory Alert Card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Critical Stock Alerts
                </h3>
              </div>
              {lowStockProducts.length > 0 && (
                <button
                  onClick={restockAllLowStock}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restock All (+25)</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800 mt-2">
              {lowStockProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-emerald-600 dark:text-emerald-400 flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <span>All product inventories are currently healthy (&gt; 8 units).</span>
                </div>
              ) : (
                lowStockProducts.map(product => (
                  <div key={product.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-10 h-10 rounded-lg object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-stone-900 dark:text-stone-100 truncate">
                          {product.title}
                        </div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-2">
                          <span className="font-mono">{product.sku}</span>
                          <span className={product.stock === 0 ? 'text-rose-600 font-bold' : 'text-amber-600 font-semibold'}>
                            {product.stock === 0 ? 'Out of stock' : `${product.stock} remaining`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => quickAdjustStock(product.id, 5)}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-md text-xs font-semibold transition"
                      >
                        +5 Units
                      </button>
                      <button
                        onClick={() => quickAdjustStock(product.id, 20)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-semibold transition"
                      >
                        +20
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>View inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Orders Overview */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Recent Store Orders
                </h3>
              </div>
              <span className="text-xs text-stone-400 font-mono">Live Sync</span>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800 mt-2">
              {orders.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400 flex flex-col items-center gap-1.5">
                  <ShoppingBag className="w-6 h-6 text-stone-300 dark:text-stone-700" />
                  <span className="font-medium text-stone-600 dark:text-stone-300">No orders logged yet</span>
                  <span className="text-[11px] text-stone-400">Purchases completed by customers will appear here in real-time.</span>
                </div>
              ) : (
                orders.slice(0, 4).map(order => (
                  <div key={order.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <span>{order.customerName}</span>
                        <span className="font-mono text-[10px] text-stone-400">({order.orderNumber})</span>
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                        <span>{order.items.length} items</span>
                        <span>·</span>
                        <span className="capitalize text-stone-400">{order.status}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-stone-900 dark:text-stone-100">
                        ${order.total.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-stone-400 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>View sales analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
