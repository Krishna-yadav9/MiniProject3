import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, CartItem, Order, AuditLogEntry, StoreConfig, CategorySales, SalesDataPoint } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { INITIAL_ORDERS, INITIAL_AUDIT_LOG, INITIAL_CONFIG, TIMELINE_SALES_30D } from '../data/initialAnalytics';
import { useAuth } from './AuthContext';

interface InventoryStats {
  totalProducts: number;
  totalStockUnits: number;
  totalRetailValue: number;
  totalCostValue: number;
  potentialProfit: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  auditLogs: AuditLogEntry[];
  config: StoreConfig;
  inventoryStats: InventoryStats;
  coupon: { code: string; discountPercent: number } | null;
  // Inventory actions
  updateStock: (productId: string, newStock: number) => void;
  quickAdjustStock: (productId: string, delta: number) => void;
  updateProduct: (productId: string, partial: Partial<Product>) => void;
  addProduct: (productData: Omit<Product, 'id' | 'slug' | 'salesCount' | 'createdAt'>) => void;
  deleteProduct: (productId: string) => void;
  restockAllLowStock: () => void;
  // Cart & Order actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string; discountPercent?: number };
  removeCoupon: () => void;
  placeOrder: (shippingAddress: Order['shippingAddress'], paymentMethod: string) => Order | null;
  // Store config
  updateConfig: (newConfig: Partial<StoreConfig>) => void;
  // Audit log helper
  logAuditEvent: (action: string, target: string, details: string, type: AuditLogEntry['type']) => void;
  // Sales analytics data
  getCategoryBreakdown: () => CategorySales[];
  getTopSellingProducts: (limit?: number) => Product[];
  getTimeSeriesData: (days?: number) => SalesDataPoint[];
  resetSalesAnalytics: () => void;
}

const STORAGE_KEY_PRODUCTS = 'apex_products_db';
const STORAGE_KEY_ORDERS = 'apex_orders_db';
const STORAGE_KEY_LOGS = 'apex_audit_logs';
const STORAGE_KEY_CONFIG = 'apex_store_config';
const STORAGE_KEY_ZERO_INIT = 'apex_analytics_zero_baseline_v3';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, recordOrder } = useAuth();

  // Products state (104 products with default salesCount: 0)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const isZeroInit = localStorage.getItem(STORAGE_KEY_ZERO_INIT);
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 100) {
          if (!isZeroInit) {
            // First time migrating to zero sales baseline: clear sales counts
            return parsed.map((p: Product) => ({ ...p, salesCount: 0 }));
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_PRODUCTS.map(p => ({ ...p, salesCount: 0 }));
  });

  // Orders state (defaults to empty array: 0 sales until purchased)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const isZeroInit = localStorage.getItem(STORAGE_KEY_ZERO_INIT);
      if (!isZeroInit) {
        localStorage.setItem(STORAGE_KEY_ZERO_INIT, 'true');
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify([]));
        return [];
      }
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_AUDIT_LOG;
  });

  // Store Configuration
  const [config, setConfig] = useState<StoreConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CONFIG;
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<{ code: string; discountPercent: number } | null>(null);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(auditLogs));
    } catch (e) {
      console.error(e);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  }, [config]);

  // Audit logger
  const logAuditEvent = (action: string, target: string, details: string, type: AuditLogEntry['type']) => {
    const newLog: AuditLogEntry = {
      id: `aud-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString(),
      action,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      target,
      details,
      type
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Inventory computations
  const inventoryStats = useMemo<InventoryStats>(() => {
    let totalStockUnits = 0;
    let totalRetailValue = 0;
    let totalCostValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
      totalStockUnits += p.stock;
      totalRetailValue += p.price * p.stock;
      totalCostValue += p.costPrice * p.stock;
      if (p.stock === 0) {
        outOfStockCount++;
      } else if (p.stock <= (p.lowStockThreshold || config.defaultLowStockThreshold)) {
        lowStockCount++;
      }
    });

    return {
      totalProducts: products.length,
      totalStockUnits,
      totalRetailValue,
      totalCostValue,
      potentialProfit: totalRetailValue - totalCostValue,
      lowStockCount,
      outOfStockCount
    };
  }, [products, config.defaultLowStockThreshold]);

  // Inventory actions
  const updateStock = (productId: string, newStock: number) => {
    const clampedStock = Math.max(0, Math.floor(newStock));
    const targetProduct = products.find(p => p.id === productId);

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, stock: clampedStock };
      }
      return p;
    }));

    if (targetProduct) {
      logAuditEvent(
        'Stock Count Updated',
        `${targetProduct.title} (${targetProduct.sku})`,
        `Stock modified from ${targetProduct.stock} to ${clampedStock} units.`,
        'inventory_update'
      );
    }
  };

  const quickAdjustStock = (productId: string, delta: number) => {
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) return;

    const newStock = Math.max(0, targetProduct.stock + delta);
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, stock: newStock };
      }
      return p;
    }));

    logAuditEvent(
      'Stock Adjusted',
      `${targetProduct.title} (${targetProduct.sku})`,
      `Quick adjust (${delta > 0 ? `+${delta}` : delta}): stock changed from ${targetProduct.stock} to ${newStock}.`,
      'inventory_update'
    );
  };

  const updateProduct = (productId: string, partial: Partial<Product>) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, ...partial };
      }
      return p;
    }));

    logAuditEvent(
      'Product Details Modified',
      `${target.title} (${target.sku})`,
      `Modified attributes: ${Object.keys(partial).join(', ')}.`,
      'inventory_update'
    );
  };

  const addProduct = (productData: Omit<Product, 'id' | 'slug' | 'salesCount' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${(products.length + 1).toString().padStart(3, '0')}`,
      slug: productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      salesCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProducts(prev => [newProduct, ...prev]);

    logAuditEvent(
      'New Product Created',
      `${newProduct.title} (${newProduct.sku})`,
      `Category: ${newProduct.category}, Initial stock: ${newProduct.stock}, Retail: $${newProduct.price.toFixed(2)}.`,
      'product_create'
    );
  };

  const deleteProduct = (productId: string) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;

    setProducts(prev => prev.filter(p => p.id !== productId));

    logAuditEvent(
      'Product Removed',
      `${target.title} (${target.sku})`,
      `Product deleted from catalog by ${currentUser.email}.`,
      'inventory_update'
    );
  };

  const restockAllLowStock = () => {
    let restockedCount = 0;
    setProducts(prev => prev.map(p => {
      if (p.stock <= (p.lowStockThreshold || config.defaultLowStockThreshold)) {
        restockedCount++;
        return { ...p, stock: Math.max(30, p.stock + 25) };
      }
      return p;
    }));

    logAuditEvent(
      'Bulk Restock Executed',
      'Inventory Catalog',
      `Auto-replenished ${restockedCount} low/out-of-stock items to healthy baseline.`,
      'inventory_update'
    );
  };

  // Cart actions
  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.min(item.product.stock, quantity) };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'SAVE10' || clean === 'WELCOME10') {
      setCoupon({ code: clean, discountPercent: 10 });
      return { success: true, message: '10% discount applied!', discountPercent: 10 };
    }
    if (clean === 'SAVE20' || clean === 'VIP20') {
      setCoupon({ code: clean, discountPercent: 20 });
      return { success: true, message: '20% VIP discount applied!', discountPercent: 20 };
    }
    if (clean === 'APEX15') {
      setCoupon({ code: clean, discountPercent: 15 });
      return { success: true, message: '15% promo discount applied!', discountPercent: 15 };
    }
    return { success: false, message: 'Invalid or expired coupon code. Try SAVE10 or APEX15' };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const placeOrder = (shippingAddress: Order['shippingAddress'], paymentMethod: string): Order | null => {
    if (cart.length === 0) return null;

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const discount = coupon ? (subtotal * coupon.discountPercent) / 100 : 0;
    const total = subtotal - discount;

    const orderNumber = `APX-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-5)}`,
      orderNumber,
      userId: currentUser.id,
      customerName: shippingAddress.fullName || currentUser.name,
      customerEmail: currentUser.email,
      items: cart.map(item => ({
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
        sku: item.product.sku
      })),
      subtotal,
      discount,
      tax: 0,
      shipping: 0,
      total,
      status: 'processing',
      paymentMethod,
      shippingAddress,
      createdAt: new Date().toISOString()
    };

    // Deduct stock and increment salesCount
    setProducts(prev => prev.map(p => {
      const orderedItem = cart.find(item => item.product.id === p.id);
      if (orderedItem) {
        return {
          ...p,
          stock: Math.max(0, p.stock - orderedItem.quantity),
          salesCount: (p.salesCount || 0) + orderedItem.quantity
        };
      }
      return p;
    }));

    // Record order
    setOrders(prev => [newOrder, ...prev]);

    // Update user stats
    recordOrder(currentUser.id, total);

    // Clear cart
    clearCart();

    logAuditEvent(
      'Order Placed',
      orderNumber,
      `Order placed by ${currentUser.email} for $${total.toFixed(2)} (${cart.length} item lines).`,
      'inventory_update'
    );

    return newOrder;
  };

  const updateConfig = (newConfig: Partial<StoreConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    logAuditEvent(
      'System Configuration Modified',
      'Store Settings',
      `Updated config fields: ${Object.keys(newConfig).join(', ')}.`,
      'config_update'
    );
  };

  // Reset Sales Analytics: Clears orders and zeroes product salesCount
  const resetSalesAnalytics = () => {
    setOrders([]);
    const resetProducts = products.map(p => ({ ...p, salesCount: 0 }));
    setProducts(resetProducts);
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(resetProducts));
    } catch (e) {
      console.error(e);
    }
    logAuditEvent(
      'Sales Analytics Reset',
      'Sales & Financial Dashboard',
      'Reset all sales analytics, charts, and order logs to zero baseline. Only future purchases will be recorded.',
      'inventory_update'
    );
  };

  // Analytics Helpers: Computed exclusively from real customer purchases
  const getCategoryBreakdown = (): CategorySales[] => {
    const categoryMap: { [cat: string]: { revenue: number; unitsSold: number } } = {};

    // Group only by actual items purchased in orders
    orders.forEach(order => {
      order.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        const cat = prod?.category || 'General';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { revenue: 0, unitsSold: 0 };
        }
        categoryMap[cat].revenue += item.price * item.quantity;
        categoryMap[cat].unitsSold += item.quantity;
      });
    });

    const totalRev = Object.values(categoryMap).reduce((s, c) => s + c.revenue, 0);

    const colors = [
      '#3b82f6', // blue
      '#10b981', // emerald
      '#f59e0b', // amber
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#f97316'  // orange
    ];

    return Object.keys(categoryMap).map((cat, idx) => ({
      category: cat,
      revenue: Math.round(categoryMap[cat].revenue * 100) / 100,
      unitsSold: categoryMap[cat].unitsSold,
      percentage: totalRev > 0 ? Math.round((categoryMap[cat].revenue / totalRev) * 100) : 0,
      color: colors[idx % colors.length]
    })).sort((a, b) => b.revenue - a.revenue);
  };

  const getTopSellingProducts = (limit: number = 8): Product[] => {
    // Only return products that have actually been purchased
    return [...products]
      .filter(p => (p.salesCount || 0) > 0)
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .slice(0, limit);
  };

  const getTimeSeriesData = (days: number = 30): SalesDataPoint[] => {
    const points: SalesDataPoint[] = [];
    const now = new Date();

    // Map orders by YYYY-MM-DD
    const dayOrdersMap: Record<string, Order[]> = {};
    orders.forEach(ord => {
      try {
        const dateKey = new Date(ord.createdAt).toISOString().split('T')[0];
        if (!dayOrdersMap[dateKey]) {
          dayOrdersMap[dateKey] = [];
        }
        dayOrdersMap[dateKey].push(ord);
      } catch {
        // ignore
      }
    });

    for (let i = days - 1; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() - i);
      const dateStr = targetDate.toISOString().split('T')[0];
      const label = targetDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

      const dayOrders = dayOrdersMap[dateStr] || [];
      const revenue = dayOrders.reduce((sum, ord) => sum + (ord.total || 0), 0);

      let profit = 0;
      dayOrders.forEach(ord => {
        ord.items.forEach(item => {
          const prod = products.find(p => p.id === item.productId);
          const cost = prod?.costPrice || (item.price * 0.6);
          profit += (item.price - cost) * item.quantity;
        });
      });

      const orderCount = dayOrders.length;
      const aov = orderCount > 0 ? revenue / orderCount : 0;

      points.push({
        date: dateStr,
        label,
        revenue: Math.round(revenue * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        orders: orderCount,
        averageOrderValue: Math.round(aov * 100) / 100
      });
    }

    return points;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        orders,
        auditLogs,
        config,
        inventoryStats,
        coupon,
        updateStock,
        quickAdjustStock,
        updateProduct,
        addProduct,
        deleteProduct,
        restockAllLowStock,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        placeOrder,
        updateConfig,
        logAuditEvent,
        getCategoryBreakdown,
        getTopSellingProducts,
        getTimeSeriesData,
        resetSalesAnalytics
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
