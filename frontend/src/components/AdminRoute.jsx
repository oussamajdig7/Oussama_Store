import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute Guard:
 * Ensures only authenticated users with role === 'admin' can access wrapped routes.
 * Non-admin users or unauthenticated visitors receive an access denied / 403 Forbidden screen.
 */
export const AdminRoute = ({ children, onNavigate }) => {
  const { user, isAuthenticated, loading, login } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminQuickLogin = async () => {
    try {
      setSwitching(true);
      setErrorMsg('');
      await login({ email: 'admin@example.com', password: 'Admin123!' });
    } catch (err) {
      setErrorMsg(err.userMessage || 'Failed to sign in as admin');
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium animate-pulse">
            Verifying administrative privileges...
          </p>
        </div>
      </div>
    );
  }

  // Case 1: Unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl mx-auto flex items-center justify-center mb-5">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            You must be signed in with an administrator account to access the Admin Dashboard.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleAdminQuickLogin}
              disabled={switching}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {switching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in as Admin...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign in as Admin (admin@example.com)</span>
                </>
              )}
            </button>

            <button
              onClick={() => onNavigate ? onNavigate('products') : (window.location.href = '/')}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              Return to Public Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Authenticated but role is not admin (403 Forbidden)
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-rose-900/30 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl mx-auto flex items-center justify-center mb-5">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>

          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-950 text-rose-400 border border-rose-800 mb-3">
            403 Forbidden
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">
            You are signed in as <span className="font-semibold text-slate-200">{user.email}</span> with role <span className="font-semibold text-amber-400">'{user.role}'</span>. Only users with role <span className="font-semibold text-indigo-400">'admin'</span> are permitted to enter this dashboard.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleAdminQuickLogin}
              disabled={switching}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {switching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Switching Account...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Switch to Admin Account</span>
                </>
              )}
            </button>

            <button
              onClick={() => onNavigate ? onNavigate('products') : (window.location.href = '/')}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              Return to Public Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Authenticated and role === 'admin'
  return children;
};

export default AdminRoute;
