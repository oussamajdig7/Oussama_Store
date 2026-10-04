import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { formatCurrency, getOrderStatusBadge } from '../../utils/formatters';

export const AdminDashboardPage = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getDashboard();
      if (res && res.data) {
        setStats(res.data.stats || res.data);
        setRecentOrders(res.data.recent_orders || []);
        setRecentUsers(res.data.recent_users || []);
        setLowStock(res.data.low_stock_products || []);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
      setError(err.userMessage || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-2xl p-5"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-900 border border-slate-800 rounded-2xl"></div>
          <div className="h-72 bg-slate-900 border border-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-center text-rose-200">
        <p className="font-semibold mb-3">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users ?? 0,
      icon: (
        <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bgGlow: 'from-sky-500/10 to-transparent',
      borderColor: 'border-sky-500/20',
      badge: 'Registered',
      badgeColor: 'text-sky-400 bg-sky-950 border-sky-800',
      onClick: () => onNavigate && onNavigate('admin-users'),
    },
    {
      title: 'Total Products',
      value: stats?.total_products ?? 0,
      icon: (
        <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bgGlow: 'from-violet-500/10 to-transparent',
      borderColor: 'border-violet-500/20',
      badge: 'Active catalog',
      badgeColor: 'text-violet-400 bg-violet-950 border-violet-800',
      onClick: () => onNavigate && onNavigate('admin-products'),
    },
    {
      title: 'Total Orders',
      value: stats?.total_orders ?? 0,
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      bgGlow: 'from-indigo-500/10 to-transparent',
      borderColor: 'border-indigo-500/20',
      badge: 'Lifetime',
      badgeColor: 'text-indigo-400 bg-indigo-950 border-indigo-800',
      onClick: () => onNavigate && onNavigate('admin-orders'),
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.total_revenue ?? 0),
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGlow: 'from-emerald-500/10 to-transparent',
      borderColor: 'border-emerald-500/20',
      badge: 'Gross sales',
      badgeColor: 'text-emerald-400 bg-emerald-950 border-emerald-800',
      onClick: () => onNavigate && onNavigate('admin-orders'),
    },
    {
      title: 'Pending Orders',
      value: stats?.pending_orders ?? 0,
      icon: (
        <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGlow: 'from-amber-500/10 to-transparent',
      borderColor: 'border-amber-500/20',
      badge: 'Action required',
      badgeColor: 'text-amber-400 bg-amber-950 border-amber-800',
      onClick: () => onNavigate && onNavigate('admin-orders'),
    },
    {
      title: 'Delivered Orders',
      value: stats?.delivered_orders ?? 0,
      icon: (
        <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGlow: 'from-teal-500/10 to-transparent',
      borderColor: 'border-teal-500/20',
      badge: 'Completed',
      badgeColor: 'text-teal-400 bg-teal-950 border-teal-800',
      onClick: () => onNavigate && onNavigate('admin-orders'),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Store Performance Overview
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Real-time analytics and management operations for Oussama Store.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            title="Refresh analytics"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('admin-products')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Product</span>
          </button>
        </div>
      </div>

      {/* 6 Core Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            onClick={card.onClick}
            className={`relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br bg-slate-900 ${card.bgGlow} border ${card.borderColor} shadow-xl hover:border-slate-700 transition-all cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-xs group-hover:scale-105 transition-transform">
                {card.icon}
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {card.value}
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Alert if any */}
      {lowStock.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-sm text-amber-200">
                Low Stock Alert ({lowStock.length} items low or out of stock)
              </div>
              <div className="text-xs text-amber-300/80">
                {lowStock.map((p) => `${p.name} (${p.stock} left)`).join(', ')}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('admin-products')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer"
          >
            Manage Inventory
          </button>
        </div>
      )}

      {/* Two Column Grid: Recent Orders & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Recent Orders</h3>
                <p className="text-slate-400 text-xs mt-0.5">Latest transactions processed</p>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('admin-orders')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>View all</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No orders recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Order</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {recentOrders.map((order) => {
                      const badge = getOrderStatusBadge(order.status);
                      return (
                        <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 font-mono font-bold text-indigo-400">
                            #{order.id}
                          </td>
                          <td className="py-3 text-slate-300">
                            <div>{order.user_name || 'Customer'}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{order.user_email}</div>
                          </td>
                          <td className="py-3 font-semibold text-white">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color} ${badge.bg} ${badge.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3 text-right text-slate-500 text-[10px]">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recent'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Users / Store Quick Stats (1 Column) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Recent Users</h3>
                <p className="text-slate-400 text-xs mt-0.5">Newly registered accounts</p>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('admin-users')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>View all</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {recentUsers.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No users found.
              </div>
            ) : (
              <div className="space-y-3.5">
                {recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                        {u.name ? u.name[0] : 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                          {u.email}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Fast shortcuts</span>
            <button
              onClick={() => onNavigate && onNavigate('admin-categories')}
              className="font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              Categories &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
