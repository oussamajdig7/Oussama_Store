import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getUsers();
      setUsers(res?.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.userMessage || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showNotification = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: '', type: '' });
    }, 4000);
  };

  const handleRoleToggle = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const confirmText =
      newRole === 'admin'
        ? `Are you sure you want to promote ${targetUser.name} (${targetUser.email}) to Admin?`
        : `Are you sure you want to revoke Admin rights for ${targetUser.name} (${targetUser.email})?`;

    if (!window.confirm(confirmText)) return;

    try {
      setUpdatingId(targetUser.id);
      const res = await adminService.updateUserRole(targetUser.id, newRole);
      if (res.success && res.data) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
        );
        showNotification(`Role for "${targetUser.name}" updated to ${newRole}`);
      }
    } catch (err) {
      showNotification(err.userMessage || 'Failed to update user role', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Users & Access Control</h2>
          <p className="text-slate-400 text-xs mt-1">
            View user profiles, monitor activity, and manage administrator role permissions.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Search & Stats */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
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
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div>
            Admins: <span className="font-bold text-indigo-400">{users.filter((u) => u.role === 'admin').length}</span>
          </div>
          <div>
            Regular Users: <span className="font-bold text-white">{users.filter((u) => u.role === 'user').length}</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs animate-pulse">
          Loading user records...
        </div>
      ) : error ? (
        <div className="bg-rose-950/40 border border-rose-800 p-6 rounded-2xl text-center text-rose-200 text-xs">
          {error}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
          No users match your query.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Orders Placed</th>
                  <th className="py-3.5 px-4">Total Spent</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Role Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredUsers.map((u) => {
                  const isSelf = currentUser && currentUser.id === u.id;
                  const isUpdating = updatingId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {u.name ? u.name[0] : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-800">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">ID: #{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            u.role === 'admin'
                              ? 'bg-indigo-950/80 text-indigo-400 border-indigo-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.role === 'admin' ? 'bg-indigo-400' : 'bg-slate-400'
                            }`}
                          ></span>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="font-mono">{u.orders_count || 0}</span> orders
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {formatCurrency(u.total_spent || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[10px]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleRoleToggle(u)}
                          disabled={isUpdating}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                            u.role === 'admin'
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                          }`}
                        >
                          {isUpdating
                            ? 'Updating...'
                            : u.role === 'admin'
                            ? 'Revoke Admin'
                            : 'Make Admin'}
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
    </div>
  );
};

export default AdminUsersPage;
