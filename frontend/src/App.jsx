import { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import AdminRoute from './components/AdminRoute';

import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';

import {
  AdminDashboardPage,
  AdminProductsPage,
  AdminCategoriesPage,
  AdminOrdersPage,
  AdminUsersPage,
} from './pages/admin';

/**
 * Helper component to wrap order details route and extract ID from URL params.
 */
function OrderDetailsRouteWrapper({ onNavigateBack }) {
  const { id } = useParams();
  return <OrderDetailsPage orderId={id} onNavigateBack={onNavigateBack} />;
}

/**
 * Inner application routes handler managing router navigation and view state.
 */
function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleNavigate = (destination) => {
    switch (destination) {
      case 'products':
        navigate('/');
        break;
      case 'cart':
        navigate('/cart');
        break;
      case 'wishlist':
        navigate('/wishlist');
        break;
      case 'checkout':
        navigate('/checkout');
        break;
      case 'orders':
        navigate('/orders');
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'admin-products':
        navigate('/admin/products');
        break;
      case 'admin-categories':
        navigate('/admin/categories');
        break;
      case 'admin-orders':
        navigate('/admin/orders');
        break;
      case 'admin-users':
        navigate('/admin/users');
        break;
      default:
        if (destination.startsWith('/')) {
          navigate(destination);
        } else {
          navigate(`/${destination}`);
        }
        break;
    }
  };

  const handleOrderSuccess = (order) => {
    setConfirmedOrder(order);
    navigate('/order-confirmation');
  };

  const handleSelectOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const getCurrentPublicView = () => {
    const p = location.pathname;
    if (p === '/cart') return 'cart';
    if (p === '/wishlist') return 'wishlist';
    if (p === '/checkout') return 'checkout';
    if (p === '/orders') return 'orders';
    if (p.startsWith('/orders/')) return 'order-details';
    if (p === '/order-confirmation') return 'order-confirmation';
    return 'products';
  };

  return (
    <Routes>
      {/* =========================================
          ADMIN DASHBOARD ROUTES (Protected)
          ========================================= */}
      <Route
        path="/admin"
        element={
          <AdminRoute onNavigate={handleNavigate}>
            <AdminLayout currentView="admin" onNavigate={handleNavigate}>
              <AdminDashboardPage onNavigate={handleNavigate} />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/products"
        element={
          <AdminRoute onNavigate={handleNavigate}>
            <AdminLayout currentView="admin-products" onNavigate={handleNavigate}>
              <AdminProductsPage onNavigate={handleNavigate} />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/categories"
        element={
          <AdminRoute onNavigate={handleNavigate}>
            <AdminLayout currentView="admin-categories" onNavigate={handleNavigate}>
              <AdminCategoriesPage onNavigate={handleNavigate} />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/orders"
        element={
          <AdminRoute onNavigate={handleNavigate}>
            <AdminLayout currentView="admin-orders" onNavigate={handleNavigate}>
              <AdminOrdersPage onNavigate={handleNavigate} />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminRoute onNavigate={handleNavigate}>
            <AdminLayout currentView="admin-users" onNavigate={handleNavigate}>
              <AdminUsersPage onNavigate={handleNavigate} />
            </AdminLayout>
          </AdminRoute>
        }
      />

      {/* =========================================
          PUBLIC STOREFRONT ROUTES (MainLayout)
          ========================================= */}
      <Route
        path="/"
        element={
          <MainLayout
            currentView={getCurrentPublicView()}
            onNavigate={handleNavigate}
            onRefresh={handleRefresh}
          >
            <ProductsPage
              refreshTrigger={refreshKey}
              onNavigateToCart={() => handleNavigate('cart')}
            />
          </MainLayout>
        }
      />

      <Route
        path="/products"
        element={<Navigate to="/" replace />}
      />

      <Route
        path="/cart"
        element={
          <MainLayout
            currentView={getCurrentPublicView()}
            onNavigate={handleNavigate}
            onRefresh={handleRefresh}
          >
            <CartPage
              onNavigateToProducts={() => handleNavigate('products')}
              onNavigateToCheckout={() => handleNavigate('checkout')}
            />
          </MainLayout>
        }
      />

      <Route
        path="/wishlist"
        element={
          <MainLayout
            currentView={getCurrentPublicView()}
            onNavigate={handleNavigate}
            onRefresh={handleRefresh}
          >
            <WishlistPage
              onNavigateToProducts={() => handleNavigate('products')}
              onNavigateToCart={() => handleNavigate('cart')}
            />
          </MainLayout>
        }
      />

      <Route
        path="/checkout"
        element={
          <MainLayout
            currentView={getCurrentPublicView()}
            onNavigate={handleNavigate}
            onRefresh={handleRefresh}
          >
            <CheckoutPage
              onOrderSuccess={handleOrderSuccess}
              onNavigateToCart={() => handleNavigate('cart')}
            />
          </MainLayout>
        }
      />

      <Route
        path="/order-confirmation"
        element={
          <MainLayout
            currentView={getCurrentPublicView()}
            onNavigate={handleNavigate}
            onRefresh={handleRefresh}
          >
            <OrderConfirmationPage
              order={confirmedOrder}
              onNavigateToOrders={() => handleNavigate('orders')}
              onNavigateToProducts={() => handleNavigate('products')}
              onNavigateToOrderDetails={handleSelectOrder}
            />
          </MainLayout>
        }
      />

      <Route
        path="/orders"
        element={
          <MainLayout
            currentView={getCurrentPublicView()}
            onNavigate={handleNavigate}
            onRefresh={handleRefresh}
          >
            <OrdersPage
              onSelectOrder={handleSelectOrder}
              onNavigateToProducts={() => handleNavigate('products')}
            />
          </MainLayout>
        }
      />

      <Route
        path="/orders/:id"
        element={
          <MainLayout
            currentView={getCurrentPublicView()}
            onNavigate={handleNavigate}
            onRefresh={handleRefresh}
          >
            <OrderDetailsRouteWrapper
              onNavigateBack={() => handleNavigate('orders')}
            />
          </MainLayout>
        }
      />

      {/* Catch-all route -> redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Root App Component wrapped with Router, Auth, Cart, and Wishlist Providers.
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppRoutes />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
