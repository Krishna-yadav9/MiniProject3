import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Percent,
  Calendar,
  Layers,
  Award,
  ArrowUpRight,
  Download,
  RotateCcw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export const SalesAnalytics: React.FC = () => {
  const { getTimeSeriesData, getCategoryBreakdown, getTopSellingProducts, resetSalesAnalytics } = useStore();

  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('30d');
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'profit' | 'orders'>('revenue');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState(false);

  const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
  const timeSeries = useMemo(() => getTimeSeriesData(daysCount), [daysCount, getTimeSeriesData]);
  const categories = useMemo(() => getCategoryBreakdown(), [getCategoryBreakdown]);
  const topProducts = useMemo(() => getTopSellingProducts(8), [getTopSellingProducts]);

  // Aggregate stats over selected period
  const totalPeriodRevenue = useMemo(() => timeSeries.reduce((s, p) => s + p.revenue, 0), [timeSeries]);
  const totalPeriodProfit = useMemo(() => timeSeries.reduce((s, p) => s + p.profit, 0), [timeSeries]);
  const totalPeriodOrders = useMemo(() => timeSeries.reduce((s, p) => s + p.orders, 0), [timeSeries]);
  const averageOrderValue = totalPeriodOrders > 0 ? totalPeriodRevenue / totalPeriodOrders : 0;
  const profitMarginPercent = totalPeriodRevenue > 0 ? (totalPeriodProfit / totalPeriodRevenue) * 100 : 0;

  // SVG dimensions for chart
  const svgWidth = 800;
  const svgHeight = 260;
  const paddingX = 45;
  const paddingY = 30;

  // Values based on active metric
  const values = timeSeries.map(p => {
    if (activeMetric === 'revenue') return p.revenue;
    if (activeMetric === 'profit') return p.profit;
    return p.orders;
  });

  const maxValue = Math.max(...values, 1) * 1.15;
  const minValue = 0;

  // Generate SVG Points
  const points = timeSeries.map((point, index) => {
    const val = activeMetric === 'revenue' ? point.revenue : activeMetric === 'profit' ? point.profit : point.orders;
    const x = paddingX + (index / (timeSeries.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - ((val - minValue) / (maxValue - minValue)) * (svgHeight - paddingY * 2);
    return { x, y, point, value: val };
  });

  // SVG Line path and Area path
  const linePath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`, '');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)},${(svgHeight - paddingY).toFixed(1)} L ${points[0].x.toFixed(1)},${(svgHeight - paddingY).toFixed(1)} Z`;

  const hoveredPoint = hoveredPointIndex !== null ? points[hoveredPointIndex] : null;

  const handleExecuteReset = () => {
    resetSalesAnalytics();
    setShowResetConfirm(false);
    setResetSuccessMessage(true);
    setTimeout(() => setResetSuccessMessage(false), 3500);
  };

  const exportAnalyticsReport = () => {
    const csvRows = [
      ['Date', 'Revenue ($)', 'Profit ($)', 'Orders', 'AOV ($)'],
      ...timeSeries.map(p => [p.date, p.revenue, p.profit, p.orders, p.averageOrderValue.toFixed(2)])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_sales_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Reset Confirmation Banner */}
      {showResetConfirm && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Confirm Reset:</strong> This will clear all order logs and reset revenue, net profit, and product sales counts to 0 baseline. Only new customer purchases will be shown.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteReset}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              Confirm & Reset to 0
            </button>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {resetSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Sales analytics have been successfully reset to 0. Order logs are cleared and waiting for real customer orders.</span>
        </div>
      )}

      {/* Header with Title and Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            Sales & Financial Analytics
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Real-time revenue, net profit, and purchase demand tracked from actual orders.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Time range buttons */}
          <div className="inline-flex rounded-lg border border-stone-200 dark:border-stone-700 p-1 bg-stone-50 dark:bg-stone-800 text-xs font-medium">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-md transition ${timeRange === '7d' ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-white font-semibold' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-3 py-1.5 rounded-md transition ${timeRange === '14d' ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-white font-semibold' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'}`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-md transition ${timeRange === '30d' ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-white font-semibold' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'}`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs font-semibold transition shadow-xs"
            title="Reset sales metrics and clear order logs to zero"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Analytics to 0</span>
          </button>

          <button
            onClick={exportAnalyticsReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-800 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Gross Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-2">
            ${totalPeriodRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium mt-1">
            {totalPeriodRevenue > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Live customer purchases</span>
              </span>
            ) : (
              <span>Zero baseline (waiting for purchases)</span>
            )}
          </div>
        </div>

        {/* Operating Profit */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 hover:border-emerald-300 dark:hover:border-emerald-800 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Net Profit
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-2">
            ${totalPeriodProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium mt-1">
            <span>{totalPeriodRevenue > 0 ? `${profitMarginPercent.toFixed(1)}% blended margin` : '0.0% net margin'}</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 hover:border-amber-300 dark:hover:border-amber-800 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Orders Processed
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-2">
            {totalPeriodOrders.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium mt-1">
            <span>{totalPeriodOrders > 0 ? `${totalPeriodOrders} customer checkout(s)` : '0 orders in selected period'}</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 hover:border-purple-300 dark:hover:border-purple-800 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Avg Order Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-2">
            ${averageOrderValue.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium mt-1">
            <span>{totalPeriodOrders > 0 ? 'Calculated from completed carts' : 'Awaiting initial customer order'}</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Graph */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Performance Timeline Trend
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Hover over data points to inspect individual date statistics.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveMetric('revenue')}
              className={`px-3 py-1.5 rounded-md transition ${activeMetric === 'revenue' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'}`}
            >
              Revenue ($)
            </button>
            <button
              onClick={() => setActiveMetric('profit')}
              className={`px-3 py-1.5 rounded-md transition ${activeMetric === 'profit' ? 'bg-emerald-600 text-white font-semibold shadow-sm' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'}`}
            >
              Net Profit ($)
            </button>
            <button
              onClick={() => setActiveMetric('orders')}
              className={`px-3 py-1.5 rounded-md transition ${activeMetric === 'orders' ? 'bg-amber-600 text-white font-semibold shadow-sm' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'}`}
            >
              Orders (Qty)
            </button>
          </div>
        </div>

        {/* Hover info badge */}
        <div className="h-9 mt-3 flex items-center justify-between">
          {hoveredPoint ? (
            <div className="inline-flex items-center gap-4 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 px-3 py-1 rounded-lg text-xs font-medium">
              <span className="flex items-center gap-1.5 text-stone-500">
                <Calendar className="w-3.5 h-3.5" />
                {hoveredPoint.point.date} ({hoveredPoint.point.label})
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                Rev: ${hoveredPoint.point.revenue.toLocaleString()}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                Profit: ${hoveredPoint.point.profit.toLocaleString()}
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                Orders: {hoveredPoint.point.orders}
              </span>
            </div>
          ) : (
            <div className="text-xs text-stone-400 italic">
              Hover over graph data points below for precise daily telemetry.
            </div>
          )}
        </div>

        {/* Responsive SVG Chart Container */}
        <div className="relative w-full overflow-x-auto pt-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[600px] select-none"
          >
            <defs>
              <linearGradient id="chartGradientIndigo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
              </linearGradient>
              <linearGradient id="chartGradientEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
              </linearGradient>
              <linearGradient id="chartGradientAmber" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = svgHeight - paddingY - pct * (svgHeight - paddingY * 2);
              const labelVal = minValue + pct * (maxValue - minValue);
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="currentColor"
                    strokeDasharray="4 4"
                    className="text-stone-200 dark:text-stone-800"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-stone-400 font-mono"
                  >
                    {activeMetric === 'orders' ? Math.round(labelVal) : `$${Math.round(labelVal).toLocaleString()}`}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            <path
              d={areaPath}
              fill={
                activeMetric === 'revenue'
                  ? 'url(#chartGradientIndigo)'
                  : activeMetric === 'profit'
                  ? 'url(#chartGradientEmerald)'
                  : 'url(#chartGradientAmber)'
              }
            />

            {/* Stroke Line */}
            <path
              d={linePath}
              fill="none"
              stroke={
                activeMetric === 'revenue'
                  ? '#4f46e5'
                  : activeMetric === 'profit'
                  ? '#10b981'
                  : '#f59e0b'
              }
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Circles & Hit areas */}
            {points.map((p, index) => {
              const isHovered = hoveredPointIndex === index;
              return (
                <g
                  key={index}
                  onMouseEnter={() => setHoveredPointIndex(index)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                  className="cursor-pointer"
                >
                  {/* Invisible hit box for comfortable mouse hover */}
                  <rect
                    x={p.x - 12}
                    y={paddingY}
                    width={24}
                    height={svgHeight - paddingY * 2}
                    fill="transparent"
                  />

                  {/* Vertical Crosshair Line on hover */}
                  {isHovered && (
                    <line
                      x1={p.x}
                      y1={paddingY}
                      x2={p.x}
                      y2={svgHeight - paddingY}
                      stroke="currentColor"
                      strokeDasharray="2 2"
                      className="text-indigo-400"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Visible Data Point */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 5.5 : 3.5}
                    fill={
                      activeMetric === 'revenue'
                        ? '#4f46e5'
                        : activeMetric === 'profit'
                        ? '#10b981'
                        : '#f59e0b'
                    }
                    className="stroke-white dark:stroke-stone-900 transition-all duration-150"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                  />

                  {/* Date labels at bottom */}
                  {(timeSeries.length <= 14 || index % 4 === 0 || index === timeSeries.length - 1) && (
                    <text
                      x={p.x}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      className="text-[10px] fill-stone-400 font-sans"
                    >
                      {p.point.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Grid: Category Sales Breakdown & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (1 col) */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Sales by Category
            </h3>
          </div>

          {categories.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400 space-y-2">
              <Layers className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto" />
              <div className="font-semibold text-stone-700 dark:text-stone-200">No Category Sales Yet</div>
              <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                All sales analytics default to zero. When customer orders are submitted, category shares will calculate in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((cat, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        {cat.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-500 font-mono">
                      <span>${cat.revenue.toLocaleString()}</span>
                      <span className="text-[11px] text-stone-400">({cat.percentage}%)</span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(4, cat.percentage)}%`,
                        backgroundColor: cat.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Products Leaderboard (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Top Revenue Generating Products
              </h3>
            </div>
            <span className="text-xs text-stone-500">Real purchase velocity</span>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-400 space-y-2">
              <Award className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto" />
              <div className="font-semibold text-stone-700 dark:text-stone-200">No Products Purchased Yet</div>
              <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
                Product sales counts default to zero. Only items purchased by customers in the storefront will appear on this leaderboard.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="pb-2 pl-1">Rank & Product</th>
                    <th className="pb-2">SKU</th>
                    <th className="pb-2 text-right">Units Sold</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Gross Revenue</th>
                    <th className="pb-2 text-right pr-1">Profit Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {topProducts.map((prod, idx) => {
                    const grossRevenue = prod.price * (prod.salesCount || 1);
                    const grossProfit = (prod.price - prod.costPrice) * (prod.salesCount || 1);
                    const marginPct = (grossProfit / grossRevenue) * 100;

                    return (
                      <tr key={prod.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition">
                        <td className="py-2.5 pl-1 flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${idx === 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' : idx === 1 ? 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300' : idx === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300' : 'text-stone-400'}`}>
                            {idx + 1}
                          </span>
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-8 h-8 rounded-lg object-cover shrink-0 border border-stone-200 dark:border-stone-700"
                          />
                          <div className="truncate max-w-[200px]">
                            <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                              {prod.title}
                            </div>
                            <div className="text-[10px] text-stone-400">
                              {prod.category}
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 font-mono text-[11px] text-stone-500">
                          {prod.sku}
                        </td>

                        <td className="py-2.5 text-right font-medium text-stone-800 dark:text-stone-200">
                          {prod.salesCount?.toLocaleString()}
                        </td>

                        <td className="py-2.5 text-right font-mono text-stone-600 dark:text-stone-400">
                          ${prod.price.toFixed(2)}
                        </td>

                        <td className="py-2.5 text-right font-mono font-bold text-stone-900 dark:text-stone-100">
                          ${grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </td>

                        <td className="py-2.5 text-right pr-1 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {marginPct.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
