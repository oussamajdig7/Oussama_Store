import { useState } from 'react';
import MainLayout from './layouts/MainLayout';
import ProductsPage from './pages/ProductsPage';

/**
 * Root App Component for Phase 8.
 * Displays the Products Catalog connected to the Express REST API.
 */
function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <MainLayout onRefresh={handleRefresh}>
      <ProductsPage refreshTrigger={refreshKey} />
    </MainLayout>
  );
}

export default App;
