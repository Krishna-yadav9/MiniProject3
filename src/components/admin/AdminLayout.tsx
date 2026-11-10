import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Forbidden403Screen } from './Forbidden403Screen';
import { DashboardOverview } from './DashboardOverview';
import { InventoryManager } from './InventoryManager';
import { SalesAnalytics } from './SalesAnalytics';
import { UserRolesManager } from './UserRolesManager';
import { DashboardConfiguration } from './DashboardConfiguration';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Users,
  Sliders,
  ArrowLeft,
  ShieldCheck,
  LogOut,
  Database
} from 'lucide-react';

interface AdminLayoutProps {
  onReturnToStore: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onReturnToStore }) => {
  const { currentUser, canAccessAdmin, logoutAdmin, adminSession } = useAuth();
  const { inventoryStats } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'analytics' | 'roles' | 'config'>('overview');

  // STRICT SPRING SECURITY ACCESS BARRIER: Must be authenticated via Admin Database with ROLE_ADMIN
  if (!canAccessAdmin) {
    return (
      <Forbidden403Screen
        onReturnToStore={onReturnToStore}
        attemptedSection="/api/admin/dashboard"
      />
    );
  }

  const handleAdminSignOut = () => {
    logoutAdmin();
    onReturnToStore();
  };

  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pb-16">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Return to storefront & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onReturnToStore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-lg transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </button>

            <div className="h-5 w-px bg-stone-200 dark:bg-stone-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-stone-900 dark:text-white">
                APEX
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/40">
                Admin Console
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" />
                <span>ROLE_ADMIN Verified (Admin DB)</span>
              </span>
            </div>
          </div>

          {/* Right: Authenticated Principal & Sign Out */}
          <div className="flex items-center gap-3">
            {/* Active Admin Profile */}
            <div className="flex items-center gap-2.5 bg-stone-100/80 dark:bg-stone-800/80 py-1 px-2.5 rounded-xl border border-stone-200/80 dark:border-stone-700/80 text-xs">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-indigo-300 dark:border-indigo-700"
              />
              <div className="text-left leading-tight hidden sm:block">
                <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                  <span>{adminSession?.name || currentUser.name}</span>
                  <span className="text-[10px] font-mono text-stone-400 font-normal">
                    (@{adminSession?.username || 'admin'})
                  </span>
                </div>
                <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                  ROLE_ADMIN
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleAdminSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 rounded-lg transition"
              title="Terminate admin session and return to customer shopping"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-100 dark:border-stone-800/80 overflow-x-auto">
          <nav className="flex space-x-1 sm:space-x-4 py-2 min-w-max text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${activeTab === 'overview' ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${activeTab === 'inventory' ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'}`}
            >
              <Package className="w-4 h-4" />
              <span>Modify Inventory</span>
              {inventoryStats.lowStockCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                  {inventoryStats.lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${activeTab === 'analytics' ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'}`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Sales Analytics with Graphs</span>
            </button>

            <button
              onClick={() => setActiveTab('roles')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${activeTab === 'roles' ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'}`}
            >
              <Users className="w-4 h-4" />
              <span>Manage User Roles & Admin DB</span>
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${activeTab === 'config' ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'}`}
            >
              <Sliders className="w-4 h-4" />
              <span>Configuration</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'overview' && <DashboardOverview onNavigateTab={setActiveTab} />}
        {activeTab === 'inventory' && <InventoryManager />}
        {activeTab === 'analytics' && <SalesAnalytics />}
        {activeTab === 'roles' && <UserRolesManager />}
        {activeTab === 'config' && <DashboardConfiguration />}
      </main>
    </div>
  );
};
