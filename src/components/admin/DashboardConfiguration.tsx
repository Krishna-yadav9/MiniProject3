import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  Sliders,
  ShieldCheck,
  Lock,
  Save,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Bell
} from 'lucide-react';
import { INITIAL_PRODUCTS } from '../../data/initialProducts';

export const DashboardConfiguration: React.FC = () => {
  const { currentUser, canConfigureDashboard } = useAuth();
  const { config, updateConfig, logAuditEvent, resetSalesAnalytics } = useStore();

  const [localConfig, setLocalConfig] = useState(config);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetCatalogSuccess, setResetCatalogSuccess] = useState(false);
  const [resetAnalyticsSuccess, setResetAnalyticsSuccess] = useState(false);

  // If user is not authorized to configure
  if (!canConfigureDashboard) {
    return (
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Configuration Locked
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
            System configuration parameters are restricted to <strong>Administrator (ROLE_ADMIN)</strong> accounts. Standard user and customer accounts are blocked by Spring Security from altering store security policies, tax rates, and thresholds.
          </p>
        </div>
        <div className="text-xs bg-stone-100 dark:bg-stone-800 p-3 rounded-xl font-mono text-stone-600 dark:text-stone-300">
          Current Authority: {currentUser.authority || 'ROLE_USER'} (Spring Security Evaluation Failed: hasRole('ADMIN'))
        </div>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(localConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetCatalog = () => {
    if (window.confirm('Reset catalog back to initial 104 products seed? Custom additions will be reset.')) {
      localStorage.setItem('apex_products_db', JSON.stringify(INITIAL_PRODUCTS));
      logAuditEvent('Catalog Database Re-seeded', 'Master Catalog', 'Restored 104 products baseline.', 'inventory_update');
      setResetCatalogSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleResetSalesAnalytics = () => {
    if (window.confirm('Reset all sales analytics and clear order history to 0? Only new customer purchases will appear.')) {
      resetSalesAnalytics();
      setResetAnalyticsSuccess(true);
      setTimeout(() => setResetAnalyticsSuccess(false), 3500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                Store Configuration
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Low stock thresholds, store branding, and security policies.
              </p>
            </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>System configuration successfully updated and saved to persistent store.</span>
        </div>
      )}

      {resetCatalogSuccess && (
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Catalog re-seeded. Reloading application...</span>
        </div>
      )}

      {resetAnalyticsSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Sales analytics have been reset to zero baseline. All order logs have been cleared.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Inventory & Stock Threshold Rules */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <Bell className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Inventory & Store Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Default Low Stock Alert Threshold (Units)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={localConfig.defaultLowStockThreshold}
                onChange={e => setLocalConfig({ ...localConfig, defaultLowStockThreshold: parseInt(e.target.value, 10) || 5 })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono text-stone-900 dark:text-white"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Products with stock &le; this number trigger reorder badges.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Storefront Display Name
              </label>
              <input
                type="text"
                value={localConfig.storeName}
                onChange={e => setLocalConfig({ ...localConfig, storeName: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Public storefront branding header and invoice issuer.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Currency Code
              </label>
              <select
                value={localConfig.currency}
                onChange={e => setLocalConfig({ ...localConfig, currency: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
              <p className="text-[11px] text-stone-400 mt-1">
                Default transaction and store presentation currency.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Access Policies */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Security Governance & Operations
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 border border-stone-200 dark:border-stone-800 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800/40 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Enforce Two-Factor Authentication (2FA) for Admin & Staff
                </div>
                <div className="text-[11px] text-stone-400">
                  Requires hardware key or TOTP code when accessing administrative dashboard.
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.requireTwoFactorForAdmin}
                onChange={e => setLocalConfig({ ...localConfig, requireTwoFactorForAdmin: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResetCatalog}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Catalog (104 SKUs)</span>
            </button>

            <button
              type="button"
              onClick={handleResetSalesAnalytics}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sales Analytics to 0</span>
            </button>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
