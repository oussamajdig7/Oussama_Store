import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminRoute } from '../components/AdminRoute';
import { AuthContext } from '../context/AuthContext';

function renderAdminRouteWithAuth(authOverrides = {}) {
  const defaultAuth = {
    user: null,
    isAuthenticated: false,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    ...authOverrides,
  };

  return render(
    <AuthContext.Provider value={defaultAuth}>
      <AdminRoute onNavigate={vi.fn()}>
        <div data-testid="protected-admin-content">Secret Admin Dashboard</div>
      </AdminRoute>
    </AuthContext.Provider>
  );
}

describe('Admin Protection Guard (AdminRoute)', () => {
  it('renders loading indicator while verifying authentication state', () => {
    renderAdminRouteWithAuth({ loading: true });

    expect(screen.getByText(/verifying administrative privileges/i)).toBeInTheDocument();
    expect(screen.queryByTestId('protected-admin-content')).not.toBeInTheDocument();
  });

  it('renders Authentication Required view for unauthenticated visitors', () => {
    renderAdminRouteWithAuth({ isAuthenticated: false, user: null });

    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(
      screen.getByText(/you must be signed in with an administrator account/i)
    ).toBeInTheDocument();
    expect(screen.queryByTestId('protected-admin-content')).not.toBeInTheDocument();
  });

  it('renders Access Denied view when user is logged in but has regular "user" role', () => {
    renderAdminRouteWithAuth({
      isAuthenticated: true,
      user: { id: 2, name: 'Normal User', role: 'user', email: 'user@example.com' },
    });

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('403 Forbidden')).toBeInTheDocument();
    expect(screen.getByText(/Only users with role/i)).toBeInTheDocument();
    expect(screen.queryByTestId('protected-admin-content')).not.toBeInTheDocument();
  });

  it('successfully grants access and renders protected content when user has "admin" role', () => {
    renderAdminRouteWithAuth({
      isAuthenticated: true,
      user: { id: 1, name: 'Admin Master', role: 'admin', email: 'admin@example.com' },
    });

    expect(screen.getByTestId('protected-admin-content')).toBeInTheDocument();
    expect(screen.getByText('Secret Admin Dashboard')).toBeInTheDocument();
  });
});
