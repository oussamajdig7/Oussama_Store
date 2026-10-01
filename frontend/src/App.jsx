import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import MainLayout from './layouts/MainLayout';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';

/**
 * Inner Application Component handling view routing and order transitions.
 */
function AppContent() {
  const [currentView, setCurrentView] = useState('products');
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOrderSuccess = (order) => {
    setConfirmedOrder(order);
    setCurrentView('order-confirmation');
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setCurrentView('order-details');
  };

  return (
    <MainLayout
      currentView={currentView}
      onNavigate={setCurrentView}
      onRefresh={handleRefresh}
    >
      {currentView === 'products' && (
        <ProductsPage
          refreshTrigger={refreshKey}
          onNavigateToCart={() => setCurrentView('cart')}
        />
      )}

      {currentView === 'cart' && (
        <CartPage
          onNavigateToProducts={() => setCurrentView('products')}
          onNavigateToCheckout={() => setCurrentView('checkout')}
        />
      )}

      {currentView === 'wishlist' && (
        <WishlistPage
          onNavigateToProducts={() => setCurrentView('products')}
          onNavigateToCart={() => setCurrentView('cart')}
        />
      )}

      {currentView === 'checkout' && (
        <CheckoutPage
          onOrderSuccess={handleOrderSuccess}
          onNavigateToCart={() => setCurrentView('cart')}
        />
      )}

      {currentView === 'order-confirmation' && (
        <OrderConfirmationPage
          order={confirmedOrder}
          onNavigateToOrders={() => setCurrentView('orders')}
          onNavigateToProducts={() => setCurrentView('products')}
          onNavigateToOrderDetails={handleSelectOrder}
        />
      )}

      {currentView === 'orders' && (
        <OrdersPage
          onSelectOrder={handleSelectOrder}
          onNavigateToProducts={() => setCurrentView('products')}
        />
      )}

      {currentView === 'order-details' && (
        <OrderDetailsPage
          orderId={selectedOrderId}
          onNavigateBack={() => setCurrentView('orders')}
        />
      )}
    </MainLayout>
  );
}

/**
 * Root App Component wrapped with Auth, Cart, and Wishlist Providers.
 */
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppContent />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
