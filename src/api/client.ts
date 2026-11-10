import { ApiResponse, AuthResponse, Cart, Order, Product, User, OverviewDTO, SalesAnalyticsDTO } from '../types';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

export function getStoredToken(): string | null {
  const raw = localStorage.getItem('apex_jwt_token');
  if (!raw) return null;
  let clean = raw.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1).trim();
  }
  if (clean.toLowerCase().startsWith('bearer ')) {
    clean = clean.substring(7).trim();
  }
  return clean || null;
}

export function getAuthHeader(customToken?: string | null): Record<string, string> {
  const token = customToken !== undefined ? customToken : getStoredToken();
  if (token && token.trim().length > 0) {
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    return { Authorization: `Bearer ${cleanToken}` };
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}, customToken?: string | null): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  // Normalize option headers
  const customHeaders: Record<string, string> = {};
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        customHeaders[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        customHeaders[key] = value;
      });
    } else {
      Object.assign(customHeaders, options.headers);
    }
  }

  const authHeader = getAuthHeader(customToken);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeader,
    ...customHeaders,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Catch proxy or HTML errors
    if (typeof data === 'string' && (data.includes('<html') || data.includes('403 Forbidden') || data.includes('502 Bad Gateway'))) {
      throw new Error('Backend service is initializing or unreachable. Please verify Spring Boot server status.');
    }

    if (!response.ok) {
      const errorMessage = typeof data === 'object' && data?.message
        ? data.message
        : (typeof data === 'string' && data ? data : `Request failed with status ${response.status}`);
      throw new Error(errorMessage);
    }

    if (data && typeof data === 'object' && 'success' in data && (data as any).success === false) {
      throw new Error((data as any).message || 'Server returned failure response');
    }

    if (data && typeof data === 'object' && 'data' in data && (data as any).data !== undefined) {
      return (data as any).data;
    }

    return data;
  } catch (error: any) {
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, error);
    throw error;
  }
}

// 1. Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (email: string, password: string, name: string, role?: string): Promise<AuthResponse> => {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  },

  me: async (customToken?: string | null): Promise<User> => {
    return request<User>('/api/auth/me', {}, customToken);
  },
};

// 2. Product API
export const productApi = {
  getAll: async (category?: string): Promise<Product[]> => {
    const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return request<Product[]>(`/api/products${query}`);
  },

  getById: async (id: string): Promise<Product> => {
    return request<Product>(`/api/products/${id}`);
  },

  create: async (product: Omit<Product, 'id' | 'createdAt'>, token?: string | null): Promise<Product> => {
    return request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }, token);
  },

  update: async (id: string, product: Partial<Product>, token?: string | null): Promise<Product> => {
    return request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }, token);
  },

  delete: async (id: string, token?: string | null): Promise<void> => {
    return request<void>(`/api/products/${id}`, {
      method: 'DELETE',
    }, token);
  },
};

// 3. Cart API
export const cartApi = {
  getCart: async (token?: string | null): Promise<Cart> => {
    return request<Cart>('/api/cart', {}, token);
  },

  addItem: async (productId: string, quantity = 1, token?: string | null): Promise<Cart> => {
    return request<Cart>('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }, token);
  },

  updateQuantity: async (productId: string, quantity: number, token?: string | null): Promise<Cart> => {
    return request<Cart>(`/api/cart/${productId}?quantity=${quantity}`, {
      method: 'PUT',
    }, token);
  },

  removeItem: async (productId: string, token?: string | null): Promise<Cart> => {
    return request<Cart>(`/api/cart/${productId}`, {
      method: 'DELETE',
    }, token);
  },

  clear: async (token?: string | null): Promise<void> => {
    return request<void>('/api/cart', {
      method: 'DELETE',
    }, token);
  },
};

// 4. Order API
export const orderApi = {
  create: async (shippingAddress: string, paymentMethod = 'CREDIT_CARD', token?: string | null): Promise<Order> => {
    return request<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress, paymentMethod }),
    }, token);
  },

  getUserOrders: async (token?: string | null): Promise<Order[]> => {
    return request<Order[]>('/api/orders', {}, token);
  },

  getAllOrders: async (token?: string | null): Promise<Order[]> => {
    return request<Order[]>('/api/orders/all', {}, token);
  },

  getOrderById: async (id: string, token?: string | null): Promise<Order> => {
    return request<Order>(`/api/orders/${id}`, {}, token);
  },

  updateStatus: async (id: string, status: string, token?: string | null): Promise<Order> => {
    return request<Order>(`/api/orders/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
    }, token);
  },
};

// 5. Analytics API
export const analyticsApi = {
  getOverview: async (token?: string | null): Promise<OverviewDTO> => {
    return request<OverviewDTO>('/api/admin/analytics/overview', {}, token);
  },

  getSales: async (range = '30d', token?: string | null): Promise<SalesAnalyticsDTO> => {
    return request<SalesAnalyticsDTO>(`/api/admin/analytics/sales?range=${encodeURIComponent(range)}`, {}, token);
  },
};

