import { Order, AuditLogEntry, StoreConfig, SalesDataPoint } from '../types';

export const INITIAL_CONFIG: StoreConfig = {
  storeName: 'ApexStore & Operations Hub',
  currency: 'USD',
  defaultLowStockThreshold: 8,
  requireTwoFactorForAdmin: true,
  allowGuestCheckout: false
};

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2026-02-19T06:12:00Z',
    action: 'Security Permission Check',
    actorEmail: 'admin@apexstore.com',
    actorRole: 'admin',
    target: 'Dashboard Configuration',
    details: 'Administrator accessed system configuration module.',
    type: 'security_event'
  },
  {
    id: 'aud-002',
    timestamp: '2026-02-18T16:20:00Z',
    action: 'Spring Security Authorization Check',
    actorEmail: 'admin@apexstore.com',
    actorRole: 'admin',
    target: '/api/admin/dashboard',
    details: 'SecurityFilterChain verified ROLE_ADMIN authority. Granted full administrative access.',
    type: 'security_event'
  },
  {
    id: 'aud-003',
    timestamp: '2026-02-18T14:45:00Z',
    action: 'Stock Adjustment',
    actorEmail: 'admin@apexstore.com',
    actorRole: 'admin',
    target: 'AeroBook Pro 16" M3 Silicon Laptop (ELEC-MBP-01)',
    details: 'Manual inventory replenishment +10 units (New stock: 24).',
    type: 'inventory_update'
  },
  {
    id: 'aud-004',
    timestamp: '2026-02-17T11:05:00Z',
    action: 'Unauthorized Access Blocked',
    actorEmail: 'customer@user.com',
    actorRole: 'user',
    target: '/admin/config',
    details: '403 Forbidden: Customer role attempted to access protected administrative dashboard configuration. Request intercepted and logged.',
    type: 'security_event'
  },
  {
    id: 'aud-005',
    timestamp: '2026-02-16T10:00:00Z',
    action: 'Product Price Modified',
    actorEmail: 'admin@apexstore.com',
    actorRole: 'admin',
    target: 'PulseBuds Pro 3 True Wireless Earbuds',
    details: 'Price updated from $219.00 to $199.50 (-9%).',
    type: 'inventory_update'
  }
];

// Default empty timeline data; populated dynamically from live purchases
export const TIMELINE_SALES_30D: SalesDataPoint[] = [];

