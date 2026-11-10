import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Product, Order } from '../types';
import { productApi, orderApi } from '../api/client';
import { AnalyticsTab } from '../components/admin/AnalyticsTab';
import { INITIAL_PRODUCTS } from '../data/productsData';
import {
  ShieldAlert,
  ShieldCheck,
  Package,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Truck,
  Clock,
  Save,
  X,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders'>('analytics');

  // Products state
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('99.99');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStock, setFormStock] = useState('25');

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  // Status/Error notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadProducts = async () => {
    setIsProductsLoading(true);
    try {
      const data = await productApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else {
        setProducts(INITIAL_PRODUCTS);
      }
    } catch (err: any) {
      console.warn('Backend unavailable, using initial catalog in admin:', err);
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setIsProductsLoading(false);
    }
  };

  const loadOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const data = await orderApi.getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      notify('error', err.message || 'Could not load system orders');
      setOrders([]);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // ALL HOOKS MUST RUN UNCONDITIONALLY AT TOP LEVEL
  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'products') {
      loadProducts();
    } else if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab, isAdmin]);

  // STRICT ACCESS BARRIER: Role-based route guard
  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto my-16 text-center p-8 bg-white rounded-3xl border border-rose-200 shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-stone-900">HTTP 403 - Forbidden</h2>
        <p className="text-xs text-stone-500 max-w-md mx-auto">
          Access to the administrative control plane is restricted to principals with authority <strong>ROLE_ADMIN</strong>. Standard customer accounts (ROLE_USER) cannot access this dashboard.
        </p>
        <div className="p-3 bg-stone-100 rounded-xl text-xs font-mono text-stone-600">
          Your Authority: {user?.role || 'UNAUTHENTICATED'}
        </div>
        <button
          onClick={() => onNavigate('products')}
          className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-md transition"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDesc('');
    setFormPrice('99.99');
    setFormCategory('Electronics');
    setFormImageUrl('https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80');
    setFormStock('30');
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormDesc(p.description);
    setFormPrice(p.price.toString());
    setFormCategory(p.category);
    setFormImageUrl(p.imageUrl);
    setFormStock(p.stockQuantity.toString());
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formName.trim(),
        description: formDesc.trim(),
        price: parseFloat(formPrice) || 0,
        category: formCategory.trim(),
        imageUrl: formImageUrl.trim(),
        stockQuantity: parseInt(formStock, 10) || 0,
      };

      if (editingProduct) {
        await productApi.update(editingProduct.id, payload);
        notify('success', `Product "${formName}" updated successfully in Firestore.`);
      } else {
        await productApi.create(payload);
        notify('success', `Product "${formName}" created successfully in Firestore.`);
      }

      setIsProductModalOpen(false);
      loadProducts();
    } catch (err: any) {
      notify('error', err.message || 'Failed to save product.');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Delete product "${name}" permanently from Firestore?`)) {
      try {
        await productApi.delete(id);
        notify('success', `Product "${name}" deleted.`);
        loadProducts();
      } catch (err: any) {
        notify('error', err.message || 'Failed to delete product.');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await orderApi.updateStatus(orderId, newStatus);
      notify('success', `Order #${orderId} marked as ${newStatus}.`);
      loadOrders();
    } catch (err: any) {
      notify('error', err.message || 'Failed to update order status.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 my-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Admin Dashboard</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ROLE_ADMIN Verified</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Direct Firestore management authenticated by Spring Security 6 & JWT
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Admin Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'products'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Inventory Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'orders'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Customer Orders
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 border animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && <AnalyticsTab />}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-base font-bold text-stone-900">Catalog Management</h2>
              <p className="text-xs text-stone-500">
                {products.length} products stored in Firestore
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>
          </div>

          {isProductsLoading ? (
            <div className="py-12 text-center text-xs text-stone-400">Loading products from Firestore...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-mono uppercase text-[10px]">
                    <th className="py-2.5">Product</th>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5">Price</th>
                    <th className="py-2.5">Stock</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-stone-900 truncate max-w-xs">{p.name}</div>
                            <div className="text-[11px] text-stone-400 truncate max-w-xs">{p.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-stone-600">{p.category}</td>
                      <td className="py-3 font-bold text-stone-900">${p.price.toFixed(2)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                          p.stockQuantity <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {p.stockQuantity} units
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-stone-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-base font-bold text-stone-900">All System Customer Orders</h2>
              <p className="text-xs text-stone-500">
                Retrieved via Spring Boot <code>/api/orders/all</code> (Admin permission required)
              </p>
            </div>
            <button
              onClick={loadOrders}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Refresh Orders
            </button>
          </div>

          {isOrdersLoading ? (
            <div className="py-12 text-center text-xs text-stone-400">Loading orders from Firestore...</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">No customer orders recorded yet.</div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border border-stone-200 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-100 text-xs">
                    <div>
                      <span className="font-mono font-bold text-stone-900">Order #{order.id}</span>
                      <span className="text-stone-400 ml-2">by {order.userEmail}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-stone-900">${order.totalAmount.toFixed(2)}</span>
                      <select
                        value={order.status}
                        onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold border border-stone-200 bg-stone-50 text-stone-800"
                      >
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs text-stone-500">
                    Destination: <span className="font-medium text-stone-800">{order.shippingAddress}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {order.items.map(item => (
                      <span key={item.productId} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 rounded-lg text-[11px] text-stone-700">
                        <span>{item.productName}</span>
                        <span className="font-bold text-indigo-600">×{item.quantity}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Inventory Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={e => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Audio">Audio</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Smart Home">Smart Home</option>
                  <option value="Office">Office</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Kitchen">Kitchen</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={formImageUrl}
                  onChange={e => setFormImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save to Firestore</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
