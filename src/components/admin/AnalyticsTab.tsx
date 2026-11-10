import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { OverviewDTO, SalesAnalyticsDTO } from '../../types';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  Calendar,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#3b82f6'];

export const AnalyticsTab: React.FC = () => {
  const { isAdmin, isAuthenticated, login } = useAuth();
  const [subTab, setSubTab] = useState<'overview' | 'sales'>('overview');
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  const [overview, setOverview] = useState<OverviewDTO | null>(null);
  const [sales, setSales] = useState<SalesAnalyticsDTO | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!isAuthenticated || !isAdmin) {
      setError('Admin authorization required: Please sign in with an Administrator account (admin@apexstore.com).');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [overviewData, salesData] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getSales(range)
      ]);
      setOverview(overviewData);
      setSales(salesData);
    } catch (err: any) {
      console.warn('Analytics API error:', err);
      setError(err.message || 'Could not load analytics metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [range, isAdmin, isAuthenticated]);

  if (isLoading && !overview && !sales) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3 shadow-sm animate-pulse">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <RefreshCw className="w-5 h-5 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-stone-600">Retrieving Spring Boot Admin Analytics...</p>
        <p className="text-[11px] text-stone-400 font-mono">Performing server-side Java stream aggregation</p>
      </div>
    );
  }

  if (error && !overview && !sales) {
    return (
      <div className="bg-white rounded-3xl border border-indigo-100 p-8 text-center space-y-4 shadow-sm max-w-md mx-auto my-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-stone-900">Admin Authorization Required</h3>
          <p className="text-xs text-stone-500 mt-1">{error}</p>
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => login('admin@apexstore.com', 'Admin@2026!')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            Sign In as Admin
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition"
          >
            Retry Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Sub-header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl">
          <button
            onClick={() => setSubTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'overview'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Overview Metrics
          </button>
          <button
            onClick={() => setSubTab('sales')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'sales'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Sales & Trends
          </button>
        </div>

        {/* Range Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            Period:
          </span>
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {(['7d', '30d', '90d'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                  range === r
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                {r === '7d' ? 'Last 7 Days' : r === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW TAB */}
      {subTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Total Revenue */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-bold">Total Revenue</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-stone-900 tracking-tight">
                ${overview.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-stone-400">Sum of valid customer orders</div>
            </div>

            {/* 2. Total Orders */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-bold">Total Orders</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-stone-900 tracking-tight">
                {overview.totalOrders.toLocaleString()}
              </div>
              <div className="text-[11px] text-stone-400">Processed store orders</div>
            </div>

            {/* 3. Average Order Value */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-bold">Avg Order Value</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-stone-900 tracking-tight">
                ${overview.averageOrderValue.toFixed(2)}
              </div>
              <div className="text-[11px] text-stone-400">Revenue per order</div>
            </div>

            {/* 4. Unique Customers */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-bold">Customers</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-stone-900 tracking-tight">
                {overview.totalUniqueCustomers.toLocaleString()}
              </div>
              <div className="text-[11px] text-stone-400">Distinct active buyers</div>
            </div>

            {/* 5. Low Stock Count */}
            <div className={`bg-white p-5 rounded-3xl border shadow-xs hover:shadow-md transition space-y-2 ${
              overview.lowStockProductCount > 0 ? 'border-amber-200 bg-amber-50/20' : 'border-stone-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-bold">Low Stock Alert</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  overview.lowStockProductCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-stone-900 tracking-tight">
                {overview.lowStockProductCount}
              </div>
              <div className="text-[11px] text-stone-400">Products with stock &lt; 10</div>
            </div>
          </div>

          {/* Quick Sales Overview Teaser Card */}
          {sales && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-900">Period Performance ({range})</h3>
                  <p className="text-xs text-stone-500">Calculated on Spring Boot server using Java streams</p>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                  sales.growthPercentage >= 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {sales.growthPercentage >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>{sales.growthPercentage >= 0 ? `+${sales.growthPercentage}%` : `${sales.growthPercentage}%`} vs previous {range}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="text-xs text-stone-500 font-medium">Current Period Revenue</div>
                  <div className="text-xl font-black text-stone-900">${sales.currentRevenue.toFixed(2)}</div>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="text-xs text-stone-500 font-medium">Previous Period Revenue</div>
                  <div className="text-xl font-black text-stone-900">${sales.previousRevenue.toFixed(2)}</div>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="text-xs text-stone-500 font-medium">Active Top Products</div>
                  <div className="text-xl font-black text-indigo-600">{sales.topProducts.length} Items</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SALES TAB */}
      {subTab === 'sales' && sales && (
        <div className="space-y-6">
          {/* Growth Summary Banner */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-left w-full sm:w-auto">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">Revenue Comparison ({range})</span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-stone-900 tracking-tight">${sales.currentRevenue.toFixed(2)}</span>
                <span className="text-xs text-stone-400">prev: ${sales.previousRevenue.toFixed(2)}</span>
              </div>
            </div>

            <div className={`px-4 py-2.5 rounded-2xl font-mono font-bold text-xs flex items-center gap-2 ${
              sales.growthPercentage >= 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {sales.growthPercentage >= 0 ? <ArrowUpRight className="w-5 h-5 text-emerald-600" /> : <ArrowDownRight className="w-5 h-5 text-rose-600" />}
              <div>
                <div>{sales.growthPercentage >= 0 ? `+${sales.growthPercentage}%` : `${sales.growthPercentage}%`} Growth</div>
                <div className="text-[10px] font-normal opacity-80">compared to prior equal period</div>
              </div>
            </div>
          </div>

          {/* Chart 1: Revenue Over Time Line Chart */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900">Revenue Trend ({range})</h3>
                <p className="text-xs text-stone-500">Daily sum of non-cancelled orders</p>
              </div>
              <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg font-bold">
                {sales.salesOverTime.length} Days Aggregated
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sales.salesOverTime} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} dot={{ r: 3, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row: Top 5 Products Bar Chart & Category Revenue Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 2: Top Products Bar Chart */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="pb-2 border-b border-stone-100">
                <h3 className="text-base font-bold text-stone-900">Top 5 Products Sold</h3>
                <p className="text-xs text-stone-500">Ranked by total units purchased</p>
              </div>

              {sales.topProducts.length === 0 ? (
                <div className="py-16 text-center text-xs text-stone-400">No product sales in selected range</div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sales.topProducts} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                      <YAxis dataKey="name" type="category" width={110} stroke="#64748b" fontSize={10} tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 15)}...` : val} />
                      <Tooltip
                        formatter={(val: any, name: any) => [
                          name === 'quantitySold' ? `${val} units` : `$${Number(val).toFixed(2)}`,
                          name === 'quantitySold' ? 'Units Sold' : 'Revenue'
                        ]}
                        contentStyle={{ borderRadius: '12px' }}
                      />
                      <Bar dataKey="quantitySold" fill="#6366f1" radius={[0, 6, 6, 0]} name="Units Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart 3: Revenue by Category Pie Chart */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="pb-2 border-b border-stone-100">
                <h3 className="text-base font-bold text-stone-900">Revenue by Category</h3>
                <p className="text-xs text-stone-500">Distribution across product categories</p>
              </div>

              {sales.categorySales.length === 0 ? (
                <div className="py-16 text-center text-xs text-stone-400">No category sales in selected range</div>
              ) : (
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sales.categorySales}
                        dataKey="revenue"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={4}
                        label={(props: any) => `${props.category || props.name || ''} (${((props.percent || 0) * 100).toFixed(0)}%)`}
                      >
                        {sales.categorySales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Order Status Breakdown Cards */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="pb-2 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">Order Status Breakdown</h3>
              <p className="text-xs text-stone-500">Distribution of all order statuses in the selected period</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(sales.statusBreakdown || {}).map(([statusKey, count]) => (
                <div key={statusKey} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex flex-col justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                    statusKey === 'DELIVERED' ? 'text-emerald-700' :
                    statusKey === 'SHIPPED' ? 'text-indigo-700' :
                    statusKey === 'PROCESSING' ? 'text-blue-700' :
                    statusKey === 'CANCELLED' ? 'text-rose-700' : 'text-stone-600'
                  }`}>
                    {statusKey}
                  </span>
                  <div className="text-2xl font-black text-stone-900 mt-2">{count}</div>
                  <div className="text-[10px] text-stone-400 mt-1">orders recorded</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
