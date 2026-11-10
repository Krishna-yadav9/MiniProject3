import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';
import {
  ShieldCheck,
  User as UserIcon,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History,
  Lock,
  Plus,
  X,
  Clock,
  Code2,
  FileCode,
  Database,
  KeyRound,
  ShieldAlert,
  ExternalLink,
  Copy
} from 'lucide-react';
import { SPRING_SECURITY_SPEC } from '../../services/springSecurity';

export const UserRolesManager: React.FC = () => {
  const {
    currentUser,
    users,
    updateUserRole,
    updateUserStatus,
    addUser,
    canManageRoles,
    adminAccounts,
    addNewAdminAccount,
    changeAdminPassword,
    firestoreConsoleUrl
  } = useAuth();

  const { auditLogs } = useStore();

  const [activeTab, setActiveTab] = useState<'users' | 'admindb' | 'matrix' | 'spring' | 'audit'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Add Customer User modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');

  // Add Admin Account state
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminFullName, setAdminFullName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Change password state
  const [changePasswordTargetId, setChangePasswordTargetId] = useState<string | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const result = updateUserRole(userId, newRole);
    if (result.success) {
      setFeedbackMessage({ text: result.message, type: 'success' });
    } else {
      setFeedbackMessage({ text: result.message, type: 'error' });
    }
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleStatusToggle = (userId: string, currentStatus: 'active' | 'suspended') => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const result = updateUserStatus(userId, newStatus);
    if (result.success) {
      setFeedbackMessage({ text: result.message, type: 'success' });
    } else {
      setFeedbackMessage({ text: result.message, type: 'error' });
    }
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      status: 'active',
      phone: newUserPhone.trim() || undefined
    });

    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setFeedbackMessage({ text: `Customer account ${newUserEmail} created.`, type: 'success' });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim() || !adminEmail.trim() || !adminPassword.trim() || !adminFullName.trim()) return;

    const res = await addNewAdminAccount({
      username: adminUsername.trim(),
      email: adminEmail.trim(),
      name: adminFullName.trim(),
      password: adminPassword.trim()
    });

    if (res.success) {
      setFeedbackMessage({ text: res.message, type: 'success' });
      setIsAddAdminOpen(false);
      setAdminUsername('');
      setAdminEmail('');
      setAdminFullName('');
      setAdminPassword('');
    } else {
      setFeedbackMessage({ text: res.message, type: 'error' });
    }
    setTimeout(() => setFeedbackMessage(null), 4500);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changePasswordTargetId || !newPasswordValue.trim()) return;

    const res = await changeAdminPassword(changePasswordTargetId, newPasswordValue.trim());
    if (res.success) {
      setFeedbackMessage({ text: res.message, type: 'success' });
      setChangePasswordTargetId(null);
      setNewPasswordValue('');
    } else {
      setFeedbackMessage({ text: res.message, type: 'error' });
    }
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between transition animate-in fade-in ${feedbackMessage.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' : 'bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'}`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-stone-400 hover:text-stone-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Role Summary */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>Security & Accounts Governance</span>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Spring Security 6.2
              </span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Admin console access is locked to usernames & passwords stored in the <strong>Admin Database</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canManageRoles && (
              <>
                <button
                  onClick={() => setIsAddAdminOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Provision Admin Account</span>
                </button>
                <button
                  onClick={() => setIsAddUserOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Customer</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 mt-5 border-b border-stone-100 dark:border-stone-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2.5 px-3 border-b-2 transition whitespace-nowrap ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
          >
            Storefront Customers ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('admindb')}
            className={`pb-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'admindb' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Admin Credentials Database ({adminAccounts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-2.5 px-3 border-b-2 transition whitespace-nowrap ${activeTab === 'matrix' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
          >
            Role Permissions Matrix
          </button>
          <button
            onClick={() => setActiveTab('spring')}
            className={`pb-2.5 px-3 border-b-2 transition whitespace-nowrap ${activeTab === 'spring' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
          >
            Spring Security Configuration
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2.5 px-3 border-b-2 transition whitespace-nowrap ${activeTab === 'audit' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
          >
            Security Audit Trail ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* TAB: ADMIN DATABASE CREDENTIALS */}
      {activeTab === 'admindb' && (
        <div className="space-y-4">
          <div className="bg-stone-900 text-white p-5 rounded-2xl border border-stone-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-100">Live Cloud Firestore Database (/admins)</h3>
                  <p className="text-[11px] text-stone-400">Database ID: ai-studio-apexstore100prod-e3cdf33d-7dbf-4bba-8144-ddfc618fde8d</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(firestoreConsoleUrl);
                    setCopiedUrl(true);
                    setTimeout(() => setCopiedUrl(false), 3000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-mono transition border border-stone-700"
                  title="Copy database console URL"
                >
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                  <span>{copiedUrl ? 'Copied Link!' : 'Copy Database URL'}</span>
                </button>

                <a
                  href={firestoreConsoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  <span>Open Database in Firebase Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="p-3 bg-stone-950/80 rounded-xl text-xs text-stone-300 border border-stone-800 space-y-1">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>Direct Database Access & Real-Time Sync</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Click the button above to manage credentials directly in the Firebase Web Console. Any administrator account, password hash, or status change you make directly in the Cloud Firestore database is synced live to this application.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Admin Username & Name</th>
                    <th className="py-3 px-4">Admin Email</th>
                    <th className="py-3 px-4">Spring Authority</th>
                    <th className="py-3 px-4">Password Hash / Credential</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {adminAccounts.map(admin => (
                    <tr key={admin.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          <span>{admin.name}</span>
                        </div>
                        <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                          @{admin.username}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-stone-600 dark:text-stone-300">
                        {admin.email}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                          {admin.authority}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-stone-500">
                        •••••••••
                        <span className="text-[10px] ml-1.5 text-stone-400">({admin.passwordHash})</span>
                      </td>

                      <td className="py-3 px-4 text-stone-500 text-[11px]">
                        {admin.lastLogin}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setChangePasswordTargetId(admin.id);
                            setNewPasswordValue('');
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300 hover:text-indigo-600 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition"
                        >
                          Change Password
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: USERS LIST */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search customers by name or email..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {(['all', 'admin', 'user'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${roleFilter === role ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold' : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'}`}
                >
                  {role === 'all' ? 'All Roles' : role === 'admin' ? 'Admins' : 'Customers'}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">User Identity</th>
                    <th className="py-3 px-4">Granted Authority</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Orders / Spend</th>
                    <th className="py-3 px-4 text-center">Modify Role</th>
                    <th className="py-3 px-4 text-right">Account Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredUsers.map(user => {
                    const isSelf = user.id === currentUser.id;

                    return (
                      <tr key={user.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition">
                        {/* Profile */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-1.5 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-stone-400 font-mono">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Current Role / Granted Authority Badge */}
                        <td className="py-3 px-4">
                          {user.role === 'admin' ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 font-mono">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>ROLE_ADMIN</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 font-mono">
                              <UserIcon className="w-3.5 h-3.5" />
                              <span>ROLE_USER</span>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {user.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium text-[11px]">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              Suspended
                            </span>
                          )}
                        </td>

                        {/* Orders & Spend */}
                        <td className="py-3 px-4 text-right">
                          <div className="font-semibold text-stone-900 dark:text-stone-100">
                            ${user.totalSpent.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-stone-400">
                            {user.totalOrders} completed orders
                          </div>
                        </td>

                        {/* ROLE MODIFIER SELECT */}
                        <td className="py-3 px-4 text-center">
                          {canManageRoles ? (
                            <select
                              value={user.role}
                              disabled={isSelf}
                              onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                              className="px-2.5 py-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <option value="admin">ROLE_ADMIN (Full Admin Access)</option>
                              <option value="user">ROLE_USER (Customer Shop Only)</option>
                            </select>
                          ) : (
                            <span className="text-[11px] text-stone-400 flex items-center justify-center gap-1">
                              <Lock className="w-3 h-3" />
                              Locked
                            </span>
                          )}
                        </td>

                        {/* Status Toggle / Actions */}
                        <td className="py-3 px-4 text-right">
                          {canManageRoles && !isSelf ? (
                            <button
                              onClick={() => handleStatusToggle(user.id, user.status)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${user.status === 'active' ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60'}`}
                            >
                              {user.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          ) : (
                            <span className="text-[11px] text-stone-400">Primary Account</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERMISSIONS MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4">
          <div className="max-w-2xl">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Role-Based Access Control (RBAC) Authority Matrix
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Spring Security evaluates <code className="font-mono">@PreAuthorize(&quot;hasRole(&#39;ADMIN&#39;)&quot;)</code> and the <code className="font-mono">SecurityFilterChain</code> to prevent standard customer accounts from touching admin configuration, inventory, or analytics.
            </p>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
              <thead className="bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-4">Feature & Operation</th>
                  <th className="py-3 px-4 text-center bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200 font-bold">
                    Administrator (ROLE_ADMIN)
                  </th>
                  <th className="py-3 px-4 text-center text-stone-700 dark:text-stone-300">
                    Customer (ROLE_USER)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {[
                  { op: 'Access Admin Dashboard (/api/admin/**)', admin: true, user: false, note: 'Spring Security throws HTTP 403 AccessDeniedException for ROLE_USER' },
                  { op: 'Modify Inventory & Physical Stock Units', admin: true, user: false, note: 'Edit SKUs, prices, quantities, and restock levels' },
                  { op: 'View Sales Analytics & Interactive Revenue Graphs', admin: true, user: false, note: 'Inspect gross revenue, margin analysis, and sales breakdown' },
                  { op: 'Provision Admin Database Credentials', admin: true, user: false, note: 'Only existing authenticated administrators can provision credentials' },
                  { op: 'Account Suspension & Security Governance', admin: true, user: false, note: 'Suspend compromised accounts and manage 2FA' },
                  { op: 'Store & Dashboard Configuration Parameters', admin: true, user: false, note: 'Modify low stock thresholds, tax rates, currency, and maintenance mode' },
                  { op: 'Browse 100+ Catalog SKUs & Add to Cart', admin: true, user: true, note: 'Public store operations permitted for all authenticated principals' },
                  { op: 'Submit Checkout & View Personal Order History', admin: true, user: true, note: 'Personal order processing permitted for authenticated users' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{row.op}</div>
                      <div className="text-[10px] text-stone-400">{row.note}</div>
                    </td>

                    <td className="py-3 px-4 text-center bg-indigo-50/30 dark:bg-indigo-950/10">
                      {row.admin ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                          <CheckCircle className="w-4 h-4" />
                          <span>Permitted</span>
                        </span>
                      ) : (
                        <XCircle className="w-4 h-4 text-stone-300 mx-auto" />
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {row.user ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                          <CheckCircle className="w-4 h-4" />
                          <span>Permitted</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-900/40">
                          Denied (403 Forbidden)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SPRING SECURITY ARCHITECTURE */}
      {activeTab === 'spring' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Spring Security 6.2 Filter Chain & SecurityConfig
              </h3>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Deterministic Java implementation protecting admin endpoints via stateless JWT and method-level access control.
            </p>
          </div>

          {/* Filter Chain flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SPRING_SECURITY_SPEC.securityFilterChain.map((filter) => (
              <div key={filter.order} className="p-3.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-stone-400 font-bold">Filter #{filter.order}</span>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">Active</span>
                </div>
                <div className="font-mono font-bold text-stone-900 dark:text-stone-100 text-xs">
                  {filter.name}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {filter.purpose}
                </p>
              </div>
            ))}
          </div>

          {/* Java Configuration Source Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-indigo-500" />
                <span>SecurityConfig.java (Spring Boot 3.2 / Spring Security 6.2)</span>
              </span>
              <span className="text-[10px] bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">Java 21</span>
            </div>
            <div className="p-4 bg-stone-950 rounded-xl font-mono text-xs text-stone-200 overflow-x-auto leading-relaxed border border-stone-800">
              <pre className="text-stone-300">
{`@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final AdminUserDetailsService adminUserDetailsService;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(adminUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // STRICT ADMIN BOUNDARY: Only principals authenticated via Admin Database with ROLE_ADMIN
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/inventory/modify/**").hasRole("ADMIN")
                .requestMatchers("/api/analytics/**").hasRole("ADMIN")
                // Customer & Admin authorized paths
                .requestMatchers("/api/orders/**").hasAnyRole("USER", "ADMIN")
                // Public endpoints
                .requestMatchers("/api/products/**", "/api/auth/**", "/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .accessDeniedHandler(accessDeniedHandler) // Returns 403 Forbidden AccessDeniedException JSON
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Security & Operations Audit Trail
                </h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Immutable event stream of stock updates, role adjustments, and security intercepts.
              </p>
            </div>
            <span className="text-xs font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2.5 py-1 rounded-md">
              {auditLogs.length} events logged
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50/50 dark:bg-stone-800/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded ${log.type === 'role_change' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300' : log.type === 'security_event' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300' : log.type === 'product_create' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300' : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'}`}
                    >
                      {log.action}
                    </span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">
                      {log.target}
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400">
                    {log.details}
                  </p>
                </div>

                <div className="text-right text-[11px] text-stone-400 shrink-0 font-mono flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <span>Actor: {log.actorEmail}</span>
                  <span className="flex items-center gap-1 text-[10px] text-stone-400">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Provision New Admin Account */}
      {isAddAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Provision Admin Database Account
                </h3>
              </div>
              <button onClick={() => setIsAddAdminOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Admin Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={adminFullName}
                  onChange={e => setAdminFullName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Admin Username (For Sign In) *
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={e => setAdminUsername(e.target.value)}
                  placeholder="e.g. jordan.admin"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Admin Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder="e.g. jordan@apexstore.internal"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Admin Password * (Min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono text-stone-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddAdminOpen(false)}
                  className="px-4 py-2 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Save to Admin Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Change Password */}
      {changePasswordTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Update Admin Password
              </h3>
              <button onClick={() => setChangePasswordTargetId(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPasswordValue}
                  onChange={e => setNewPasswordValue(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono text-stone-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setChangePasswordTargetId(null)}
                  className="px-3 py-1.5 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Customer User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Create Storefront Customer Account
              </h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="e.g. jordan.h@customer.com"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={newUserPhone}
                  onChange={e => setNewUserPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
