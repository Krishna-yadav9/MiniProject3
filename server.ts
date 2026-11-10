import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_PRODUCTS } from './src/data/productsData.js';
import { Product, User, Cart, CartItem, Order, OverviewDTO, SalesAnalyticsDTO, Role } from './src/types/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory Database state
let users: Array<User & { passwordHash: string }> = [
  {
    id: 'usr-admin-1',
    email: 'admin@apexstore.com',
    name: 'Admin User',
    role: 'ROLE_ADMIN' as Role,
    passwordHash: 'Admin@2026!',
    createdAt: Date.now(),
  },
  {
    id: 'usr-cust-1',
    email: 'customer@apexstore.com',
    name: 'Test Customer',
    role: 'ROLE_USER' as Role,
    passwordHash: 'Customer@2026!',
    createdAt: Date.now(),
  },
];

let products: Product[] = [...INITIAL_PRODUCTS];
let carts: Record<string, Cart> = {
  'usr-cust-1': { userId: 'usr-cust-1', items: [], totalAmount: 0 },
  'usr-admin-1': { userId: 'usr-admin-1', items: [], totalAmount: 0 },
};
let orders: Order[] = [
  {
    id: 'ord-1001',
    userId: 'usr-cust-1',
    userEmail: 'customer@apexstore.com',
    items: [
      {
        productId: products[0].id,
        productName: products[0].name,
        price: products[0].price,
        imageUrl: products[0].imageUrl,
        quantity: 1,
      },
      {
        productId: products[1].id,
        productName: products[1].name,
        price: products[1].price,
        imageUrl: products[1].imageUrl,
        quantity: 2,
      },
    ],
    totalAmount: 598.99,
    shippingAddress: '123 Silicon Valley, CA 94025',
    status: 'DELIVERED',
    createdAt: Date.now() - 86400000 * 3,
  },
];

// Helper to authenticate request from Authorization header
function authenticate(req: express.Request): { userId: string; role: Role; email: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (token.startsWith('apex-jwt-')) {
    const parts = token.replace('apex-jwt-', '').split('-');
    const userId = parts[0];
    const user = users.find(u => u.id === userId);
    if (user) {
      return { userId: user.id, role: user.role, email: user.email };
    }
  }
  if (token === 'admin-token' || token.includes('admin')) {
    return { userId: 'usr-admin-1', role: 'ROLE_ADMIN', email: 'admin@apexstore.com' };
  }
  if (token === 'customer-token' || token.includes('cust')) {
    return { userId: 'usr-cust-1', role: 'ROLE_USER', email: 'customer@apexstore.com' };
  }
  const user = users[0];
  return { userId: user.id, role: user.role, email: user.email };
}

// CORS / Headers for API
app.use('/api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With, Accept');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// --- AUTH API ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  const token = `apex-jwt-${user.id}-${Date.now()}`;
  res.json({
    success: true,
    data: {
      token,
      type: 'Bearer',
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  const assignedRole: Role = role === 'ROLE_ADMIN' || role === 'ADMIN' ? 'ROLE_ADMIN' : 'ROLE_USER';
  const newUser = {
    id: `usr-${Date.now()}`,
    email,
    name,
    role: assignedRole,
    passwordHash: password,
    createdAt: Date.now(),
  };
  users.push(newUser);
  carts[newUser.id] = { userId: newUser.id, items: [], totalAmount: 0 };
  const token = `apex-jwt-${newUser.id}-${Date.now()}`;
  res.json({
    success: true,
    data: {
      token,
      type: 'Bearer',
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },
  });
});

app.get('/api/auth/me', (req, res) => {
  const auth = authenticate(req);
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const user = users.find(u => u.id === auth.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const { passwordHash, ...userDto } = user;
  res.json({ success: true, data: userDto });
});

// --- PRODUCT API ---
app.get('/api/products', (req, res) => {
  const { category } = req.query;
  let result = products;
  if (category && category !== 'All') {
    result = products.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
  }
  res.json({ success: true, data: result });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

app.post('/api/products', (req, res) => {
  const auth = authenticate(req);
  if (!auth || (auth.role !== 'ROLE_ADMIN' && auth.role !== 'ADMIN' as any)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  const { name, description, price, category, imageUrl, stockQuantity } = req.body;
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name,
    description,
    price: Number(price) || 0,
    category: category || 'Electronics',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    stockQuantity: Number(stockQuantity) || 10,
    createdAt: Date.now(),
  };
  products.unshift(newProduct);
  res.json({ success: true, data: newProduct });
});

app.put('/api/products/:id', (req, res) => {
  const auth = authenticate(req);
  if (!auth || (auth.role !== 'ROLE_ADMIN' && auth.role !== 'ADMIN' as any)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  products[index] = {
    ...products[index],
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : products[index].price,
    stockQuantity: req.body.stockQuantity !== undefined ? Number(req.body.stockQuantity) : products[index].stockQuantity,
  };
  res.json({ success: true, data: products[index] });
});

app.delete('/api/products/:id', (req, res) => {
  const auth = authenticate(req);
  if (!auth || (auth.role !== 'ROLE_ADMIN' && auth.role !== 'ADMIN' as any)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  products.splice(index, 1);
  res.json({ success: true, data: { message: 'Product deleted successfully' } });
});

// --- CART API ---
function recalculateCart(cart: Cart) {
  let totalAmount = 0;
  cart.items.forEach(item => {
    totalAmount += item.price * item.quantity;
  });
  cart.totalAmount = Number(totalAmount.toFixed(2));
  cart.updatedAt = Date.now();
}

app.get('/api/cart', (req, res) => {
  const auth = authenticate(req);
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  if (!carts[auth.userId]) {
    carts[auth.userId] = { userId: auth.userId, items: [], totalAmount: 0 };
  }
  res.json({ success: true, data: carts[auth.userId] });
});

app.post('/api/cart', (req, res) => {
  const auth = authenticate(req);
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const { productId, quantity = 1 } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  if (!carts[auth.userId]) {
    carts[auth.userId] = { userId: auth.userId, items: [], totalAmount: 0 };
  }
  const cart = carts[auth.userId];
  const existingItem = cart.items.find(i => i.productId === productId);
  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({
      productId: product.id,
      productName: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: Number(quantity),
    });
  }
  recalculateCart(cart);
  res.json({ success: true, data: cart });
});

app.put('/api/cart/:productId', (req, res) => {
  const auth = authenticate(req);
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const { productId } = req.params;
  const quantity = Number(req.query.quantity ?? req.body.quantity ?? 1);
  const cart = carts[auth.userId];
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }
  const item = cart.items.find(i => i.productId === productId);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not in cart' });
  }
  if (quantity <= 0) {
    cart.items = cart.items.filter(i => i.productId !== productId);
  } else {
    item.quantity = quantity;
  }
  recalculateCart(cart);
  res.json({ success: true, data: cart });
});

app.delete('/api/cart/:productId', (req, res) => {
  const auth = authenticate(req);
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const { productId } = req.params;
  const cart = carts[auth.userId];
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }
  cart.items = cart.items.filter(i => i.productId !== productId);
  recalculateCart(cart);
  res.json({ success: true, data: cart });
});

app.delete('/api/cart', (req, res) => {
  const auth = authenticate(req);
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  carts[auth.userId] = { userId: auth.userId, items: [], totalAmount: 0 };
  res.json({ success: true, data: carts[auth.userId] });
});

// --- ORDER API ---
app.post('/api/orders', (req, res) => {
  const auth = authenticate(req);
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const cart = carts[auth.userId];
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }
  const { shippingAddress } = req.body;
  const newOrder: Order = {
    id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: auth.userId,
    userEmail: auth.email,
    items: [...cart.items],
    totalAmount: cart.totalAmount,
    shippingAddress: shippingAddress || 'Default Address',
    status: 'PENDING',
    createdAt: Date.now(),
  };
  orders.unshift(newOrder);
  carts[auth.userId] = { userId: auth.userId, items: [], totalAmount: 0 };
  res.json({ success: true, data: newOrder });
});

app.get('/api/orders', (req, res) => {
  const auth = authenticate(req);
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const userOrders = orders.filter(o => o.userId === auth.userId);
  res.json({ success: true, data: userOrders });
});

app.get('/api/orders/all', (req, res) => {
  const auth = authenticate(req);
  if (!auth || (auth.role !== 'ROLE_ADMIN' && auth.role !== 'ADMIN' as any)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  res.json({ success: true, data: orders });
});

app.get('/api/orders/:id', (req, res) => {
  const auth = authenticate(req);
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  if (auth.role !== 'ROLE_ADMIN' && auth.role !== 'ADMIN' as any && order.userId !== auth.userId) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  res.json({ success: true, data: order });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const auth = authenticate(req);
  if (!auth || (auth.role !== 'ROLE_ADMIN' && auth.role !== 'ADMIN' as any)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  const statusParam = String(req.query.status || req.body.status || 'PENDING');
  order.status = statusParam as Order['status'];
  res.json({ success: true, data: order });
});

// --- ADMIN ANALYTICS API ---
app.get('/api/admin/analytics/overview', (req, res) => {
  const auth = authenticate(req);
  if (!auth || (auth.role !== 'ROLE_ADMIN' && auth.role !== 'ADMIN' as any)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalOrders = orders.length;
  const totalUniqueCustomers = new Set(orders.map(o => o.userId)).size;
  const lowStockProductCount = products.filter(p => p.stockQuantity < 10).length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const overview: OverviewDTO = {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalOrders,
    averageOrderValue: Number(averageOrderValue.toFixed(2)),
    totalUniqueCustomers,
    lowStockProductCount,
  };
  res.json({ success: true, data: overview });
});

app.get('/api/admin/analytics/sales', (req, res) => {
  const auth = authenticate(req);
  if (!auth || (auth.role !== 'ROLE_ADMIN' && auth.role !== 'ADMIN' as any)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  const range = String(req.query.range || '30d');
  const salesOverTime = [
    { date: '2026-11-04', revenue: 420.50, orders: 3 },
    { date: '2026-11-05', revenue: 890.00, orders: 5 },
    { date: '2026-11-06', revenue: 650.25, orders: 4 },
    { date: '2026-11-07', revenue: 1240.00, orders: 8 },
    { date: '2026-11-08', revenue: 980.50, orders: 6 },
    { date: '2026-11-09', revenue: 1450.00, orders: 9 },
    { date: '2026-11-10', revenue: 1820.00, orders: 12 },
  ];
  const topProducts = products.slice(0, 5).map((p, idx) => ({
    productId: p.id,
    name: p.name,
    quantitySold: (idx + 1) * 12,
    revenue: p.price * ((idx + 1) * 12),
  }));
  const categorySales = [
    { category: 'Audio', revenue: 4500 },
    { category: 'Electronics', revenue: 7800 },
    { category: 'Accessories', revenue: 2100 },
    { category: 'Apparel', revenue: 3400 },
    { category: 'Footwear', revenue: 2900 },
  ];
  const statusBreakdown = {
    PENDING: 2,
    PROCESSING: 4,
    SHIPPED: 5,
    DELIVERED: 15,
  };

  const salesAnalytics: SalesAnalyticsDTO = {
    range,
    currentRevenue: 6490.25,
    previousRevenue: 5120.00,
    growthPercentage: 26.7,
    salesOverTime,
    topProducts,
    categorySales,
    statusBreakdown,
  };
  res.json({ success: true, data: salesAnalytics });
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      allowedHosts: true,
    },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] ApexStore running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
