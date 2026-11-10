export type Role = 'ROLE_USER' | 'ROLE_ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: number;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stockQuantity: number;
  createdAt?: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalAmount: number;
  updatedAt?: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: CartItem[];
  totalAmount: number;
  shippingAddress: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  createdAt: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: number;
}

export interface OverviewDTO {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalUniqueCustomers: number;
  lowStockProductCount: number;
}

export interface SalesPointDTO {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProductDTO {
  productId: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface CategorySalesDTO {
  category: string;
  revenue: number;
}

export interface SalesAnalyticsDTO {
  range: string;
  currentRevenue: number;
  previousRevenue: number;
  growthPercentage: number;
  salesOverTime: SalesPointDTO[];
  topProducts: TopProductDTO[];
  categorySales: CategorySalesDTO[];
  statusBreakdown: Record<string, number>;
}

