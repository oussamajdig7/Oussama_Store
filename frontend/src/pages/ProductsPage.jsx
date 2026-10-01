import { useState, useEffect, useMemo, useCallback } from 'react';
import { getProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { useCart } from '../hooks/useCart';
import ProductCard from '../components/ProductCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

/**
 * ProductsPage: Fetches and displays products catalog from Express API.
 * Supports adding items to cart, category filtering, search, and state handling.
 */
export const ProductsPage = ({ refreshTrigger = 0, onNavigateToCart }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [localTrigger, setLocalTrigger] = useState(0);
  const [notification, setNotification] = useState(null);

  const { addToCart } = useCart();

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    setLocalTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.allSettled([
          getProducts(),
          getCategories(),
        ]);

        if (!isMounted) return;

        if (productsRes.status === 'fulfilled') {
          const prodData = productsRes.value;
          setProducts(Array.isArray(prodData?.data) ? prodData.data : []);
        } else {
          throw productsRes.reason;
        }

        if (categoriesRes.status === 'fulfilled') {
          const catData = categoriesRes.value;
          setCategories(Array.isArray(catData?.data) ? catData.data : []);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error loading products:', err);
        setError(
          err.userMessage ||
            'Failed to load products from API. Please verify the Express backend server is running on http://localhost:5000'
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger, localTrigger]);

  // Handle Add to Cart action with feedback
  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      setNotification(null);
      await addToCart(productId, quantity);
      const addedProduct = products.find((p) => p.id === productId);
      setNotification({
        type: 'success',
        message: `${addedProduct ? addedProduct.name : 'Item'} added to your cart.`,
      });
      setTimeout(() => {
        setNotification(null);
      }, 4000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.userMessage || 'Failed to add item to cart.',
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  // Client-side filtering by category and search term
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'ALL' ||
        String(product.category_id) === String(selectedCategory);

      const matchesSearch =
        searchTerm.trim() === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm transition-all animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{notification.message}</span>
          </div>

          {notification.type === 'success' && onNavigateToCart && (
            <button
              onClick={onNavigateToCart}
              className="ml-3 underline hover:no-underline font-bold text-emerald-700 dark:text-emerald-300"
            >
              View Cart &rarr;
            </button>
          )}
        </div>
      )}

      {/* Hero / Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 mb-2">
            <span>Phase 9</span>
            <span>&bull;</span>
            <span>Live Catalog &amp; Cart</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Products Catalog
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-500 dark:text-slate-400">
            Explore our collection loaded live from SQLite via Express REST API.
          </p>
        </div>

        {/* Live Count Pill */}
        {!loading && !error && (
          <div className="flex items-center gap-2 self-start md:self-auto text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>
              {filteredProducts.length} of {products.length}{' '}
              {products.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Controls */}
      {!loading && !error && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80'
              }`}
            >
              All Categories ({products.length})
            </button>
            {categories.map((category) => {
              const count = products.filter(
                (p) => String(p.category_id) === String(category.id)
              ).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(String(category.id))}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                    selectedCategory === String(category.id)
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  }`}
                >
                  {category.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px] sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-2xs"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content: Loading, Error, Empty, or Product Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={handleRetry} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title={products.length === 0 ? 'No Products Available' : 'No Matching Products'}
          description={
            products.length === 0
              ? 'The backend database does not currently have any products.'
              : `No products match "${searchTerm}" in the selected category.`
          }
          onReset={
            products.length > 0
              ? () => {
                  setSelectedCategory('ALL');
                  setSearchTerm('');
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
