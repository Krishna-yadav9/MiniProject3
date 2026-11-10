import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { CATEGORIES } from '../../data/initialProducts';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  X,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const {
    products,
    updateStock,
    quickAdjustStock,
    updateProduct,
    addProduct,
    deleteProduct,
    restockAllLowStock,
    inventoryStats
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'healthy'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'stock-asc' | 'stock-desc' | 'price-desc'>('stock-asc');

  // Modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  // New product form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[1]);
  const [newPrice, setNewPrice] = useState('99.00');
  const [newCostPrice, setNewCostPrice] = useState('45.00');
  const [newStock, setNewStock] = useState('30');
  const [newSku, setNewSku] = useState('');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80');
  const [newDescription, setNewDescription] = useState('');

  // Auto generate SKU when category/title change
  const handleAutoGenerateSku = () => {
    const prefix = newCategory.slice(0, 3).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setNewSku(`${prefix}-${rand}`);
  };

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;

        let matchesStock = true;
        if (stockFilter === 'low') matchesStock = p.stock > 0 && p.stock <= p.lowStockThreshold;
        if (stockFilter === 'out') matchesStock = p.stock === 0;
        if (stockFilter === 'healthy') matchesStock = p.stock > p.lowStockThreshold;

        return matchesSearch && matchesCat && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'stock-asc') return a.stock - b.stock;
        if (sortBy === 'stock-desc') return b.stock - a.stock;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy]);

  // Export inventory to CSV
  const handleExportCSV = () => {
    const csvRows = [
      ['ID', 'SKU', 'Title', 'Category', 'Price ($)', 'Cost Price ($)', 'Stock', 'Threshold', 'Status', 'Sales Count'],
      ...products.map(p => [
        p.id,
        p.sku,
        `"${p.title.replace(/"/g, '""')}"`,
        p.category,
        p.price.toFixed(2),
        p.costPrice.toFixed(2),
        p.stock,
        p.lowStockThreshold,
        p.status,
        p.salesCount
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addProduct({
      title: newTitle.trim(),
      category: newCategory,
      price: parseFloat(newPrice) || 0,
      originalPrice: (parseFloat(newPrice) || 0) * 1.2,
      costPrice: parseFloat(newCostPrice) || 0,
      stock: parseInt(newStock, 10) || 0,
      lowStockThreshold: 8,
      rating: 5.0,
      reviewsCount: 0,
      sku: newSku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      image: newImage.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      description: newDescription.trim() || 'Premium product addition to store catalog.',
      features: ['Engineered with premium quality materials', 'Factory tested for performance', 'Standard warranty included'],
      tags: [newCategory.toLowerCase().split(' ')[0], 'new-arrival'],
      status: 'active'
    });

    setIsAddModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewPrice('99.00');
    setNewCostPrice('45.00');
    setNewStock('30');
    setNewSku('');
    setNewDescription('');
  };

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateProduct(editingProduct.id, {
      title: editingProduct.title,
      category: editingProduct.category,
      price: Number(editingProduct.price),
      costPrice: Number(editingProduct.costPrice),
      stock: Number(editingProduct.stock),
      lowStockThreshold: Number(editingProduct.lowStockThreshold),
      status: editingProduct.status,
      description: editingProduct.description,
      sku: editingProduct.sku,
      image: editingProduct.image
    });

    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase font-semibold">Total SKUs</div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
            {inventoryStats.totalProducts} Items
          </div>
          <div className="text-xs text-stone-400 mt-0.5">Active catalog items</div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase font-semibold">Units on Hand</div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
            {inventoryStats.totalStockUnits.toLocaleString()} units
          </div>
          <div className="text-xs text-stone-400 mt-0.5">${(inventoryStats.totalRetailValue / 1000).toFixed(1)}k valuation</div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
          <div className="text-xs text-amber-600 dark:text-amber-400 uppercase font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Low Stock</span>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {inventoryStats.lowStockCount} Items
          </div>
          <div className="text-xs text-stone-400 mt-0.5">&le; 8 units remaining</div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
          <div className="text-xs text-rose-600 dark:text-rose-400 uppercase font-semibold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Out of Stock</span>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {inventoryStats.outOfStockCount} Items
          </div>
          <div className="text-xs text-stone-400 mt-0.5">Reorder required</div>
        </div>
      </div>

      {/* Action Header & Filter Controls */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              Inventory Management
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Update physical stock levels, manage pricing, and edit product listings.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {inventoryStats.lowStockCount > 0 && (
              <button
                onClick={restockAllLowStock}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restock All Low Items (+25)</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-stone-700 dark:text-stone-200 rounded-lg text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                handleAutoGenerateSku();
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Search & Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by product title, SKU (e.g. ELEC-), category..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stock status filter */}
          <div>
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Stock: All Levels</option>
              <option value="low">Stock: Low (&le; 8 units)</option>
              <option value="out">Stock: Out of Stock (0)</option>
              <option value="healthy">Stock: Healthy (&gt; 8 units)</option>
            </select>
          </div>
        </div>

        {/* Results summary & sorting tabs */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100 dark:border-stone-800">
          <span>
            Showing <strong className="text-stone-900 dark:text-stone-100">{filteredProducts.length}</strong> of {products.length} catalog items
          </span>

          <div className="flex items-center gap-2">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent border-0 text-stone-700 dark:text-stone-300 font-medium focus:ring-0 cursor-pointer"
            >
              <option value="stock-asc">Stock: Lowest First</option>
              <option value="stock-desc">Stock: Highest First</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title">Title: Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Retail / Cost</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Stock Control (Inline Edit)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredProducts.map(product => {
                const isOutOfStock = product.stock === 0;
                const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 8);
                const margin = ((product.price - product.costPrice) / product.price) * 100;

                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition ${isOutOfStock ? 'bg-rose-50/30 dark:bg-rose-950/10' : isLowStock ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''}`}
                  >
                    {/* Item & SKU */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-11 h-11 rounded-lg object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                        />
                        <div className="min-w-0 max-w-[240px]">
                          <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                            {product.title}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-1.5 py-0.5 rounded">
                              {product.sku}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {product.salesCount || 0} sold
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                      {product.category}
                    </td>

                    {/* Pricing & Margin */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono font-bold text-stone-900 dark:text-stone-100">
                        ${product.price.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        Cost: ${product.costPrice.toFixed(2)} ({margin.toFixed(0)}% mrg)
                      </div>
                    </td>

                    {/* Stock Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400">
                          <XCircle className="w-3 h-3" />
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400">
                          <AlertCircle className="w-3 h-3" />
                          Low ({product.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          In Stock ({product.stock})
                        </span>
                      )}
                    </td>

                    {/* INLINE STOCK CONTROL */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden bg-stone-50 dark:bg-stone-800 shadow-xs">
                        <button
                          onClick={() => quickAdjustStock(product.id, -1)}
                          disabled={product.stock <= 0}
                          title="Decrease stock by 1"
                          className="px-2.5 py-1 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold text-sm"
                        >
                          -
                        </button>

                        <input
                          type="number"
                          min="0"
                          value={product.stock}
                          onChange={e => updateStock(product.id, parseInt(e.target.value, 10) || 0)}
                          className="w-14 text-center py-1 bg-transparent font-mono font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:bg-white dark:focus:bg-stone-900 text-xs"
                        />

                        <button
                          onClick={() => quickAdjustStock(product.id, 1)}
                          title="Increase stock by 1"
                          className="px-2.5 py-1 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition font-bold text-sm"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingProduct({ ...product })}
                          title="Edit Product"
                          className="p-1.5 rounded-lg text-stone-500 hover:text-indigo-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmationId(product.id)}
                          title="Delete Product"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add New Product */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Add New Product to Catalog
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. ApexPro Carbon Gaming Mouse"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    SKU Identifier *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newSku}
                      onChange={e => setNewSku(e.target.value)}
                      placeholder="e.g. GAME-9901"
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono text-stone-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAutoGenerateSku}
                      className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 rounded-lg text-xs"
                      title="Auto generate"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Retail Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Cost Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newCostPrice}
                    onChange={e => setNewCostPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Initial Stock (Qty) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newStock}
                    onChange={e => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Product Image URL
                </label>
                <input
                  type="url"
                  value={newImage}
                  onChange={e => setNewImage(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white"
                />
                {newImage && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={newImage}
                      alt="Preview"
                      className="w-14 h-14 rounded-lg object-cover border border-stone-200 dark:border-stone-700"
                      onError={() => setNewImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80')}
                    />
                    <span className="text-[11px] text-stone-400">Live preview thumbnail</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Write clear product description and key selling propositions..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Save & Publish to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Product */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Edit Product & Inventory Parameters
                </h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={e => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Selling Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.costPrice}
                    onChange={e => setEditingProduct({ ...editingProduct, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Current Stock Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stock}
                    onChange={e => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingProduct.lowStockThreshold}
                    onChange={e => setEditingProduct({ ...editingProduct, lowStockThreshold: parseInt(e.target.value, 10) || 8 })}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editingProduct.status}
                    onChange={e => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white"
                  >
                    <option value="active">Active (Visible in Catalog)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Product Image URL
                </label>
                <input
                  type="url"
                  value={editingProduct.image}
                  onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Apply Inventory Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Confirm Product Removal
              </h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 mb-5">
              Are you sure you want to delete this product from the inventory catalog? This action will immediately remove it from customer store listings.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmationId(null)}
                className="px-4 py-2 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteConfirmationId);
                  setDeleteConfirmationId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
              >
                Delete from Catalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
