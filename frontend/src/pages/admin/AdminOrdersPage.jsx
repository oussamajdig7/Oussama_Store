import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { formatCurrency, getOrderStatusBadge } from '../../utils/formatters';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getOrders();
      setOrders(res?.data || []);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
      setError(err.userMessage || 'Failed to load store orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const showNotification = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: '', type: '' });
    }, 4000);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await adminService.updateOrderStatus(orderId, newStatus);
      if (res.success && res.data) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
        showNotification(`Order #${orderId} status changed to ${newStatus}`);
      }
    } catch (err) {
      showNotification(err.userMessage || 'Failed to update order status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toString().includes(searchQuery) ||
      (o.user_name && o.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.user_email && o.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.shipping_address && o.shipping_address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || o.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback.message && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-xs font-semibold animate-bounce ${
            feedback.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-800'
              : 'bg-emerald-950 text-emerald-200 border-emerald-800'
          }`}
        >
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Customer Orders</h2>
          <p className="text-slate-400 text-xs mt-1">
            Track order fulfillment, inspect items, and update delivery status across the store.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {st} {st !== 'all' && `(${orders.filter((o) => o.status === st).length})`}
            </button>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="relative w-full sm:w-96">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by Order ID, customer, email, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs animate-pulse">
          Loading orders...
        </div>
      ) : error ? (
        <div className="bg-rose-950/40 border border-rose-800 p-6 rounded-2xl text-center text-rose-200 text-xs">
          {error}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
          No orders match your filter criteria.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status & Update</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredOrders.map((order) => {
                  const badge = getOrderStatusBadge(order.status);
                  const isUpdating = updatingId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                        #{order.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{order.user_name || 'Customer'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{order.user_email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[10px]">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {order.items_count || order.items?.length || 0} items
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            disabled={isUpdating}
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold border cursor-pointer focus:outline-none transition-colors ${badge.color} ${badge.bg} ${badge.border}`}
                          >
                            <option value="pending" className="bg-slate-900 text-slate-200">Pending</option>
                            <option value="processing" className="bg-slate-900 text-slate-200">Processing</option>
                            <option value="shipped" className="bg-slate-900 text-slate-200">Shipped</option>
                            <option value="delivered" className="bg-slate-900 text-slate-200">Delivered</option>
                            <option value="cancelled" className="bg-slate-900 text-slate-200">Cancelled</option>
                          </select>
                          {isUpdating && (
                            <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Order Details</span>
                  <span className="text-indigo-400 font-mono">#{selectedOrder.id}</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Customer</span>
                <div className="font-semibold text-white">{selectedOrder.user_name || 'N/A'}</div>
                <div className="text-slate-400 font-mono text-[11px]">{selectedOrder.user_email}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Shipping Address</span>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedOrder.shipping_address || 'No address provided'}
                </div>
              </div>
            </div>

            {/* Items List */}
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-2">Order Line Items</span>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/30 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{item.product_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Qty: {item.quantity} &times; {formatCurrency(item.price)}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-white text-xs">
                        {formatCurrency(item.quantity * item.price)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs py-2">No item lines stored.</div>
                )}
              </div>
            </div>

            {/* Total and Status Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="text-right">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Grand Total</span>
                <span className="text-lg font-extrabold text-emerald-400">
                  {formatCurrency(selectedOrder.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
