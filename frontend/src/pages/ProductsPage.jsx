import { useState, useEffect, useMemo, useCallback } from 'react';
import { getProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import ProductCard from '../components/ProductCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

/**
 * ProductsPage: Fetches and displays products catalog from Express API.
 * Handles loading, error, and empty states.
 */
export const ProductsPage = ({ refreshTrigger = 0 }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [localTrigger, setLocalTrigger] = useState(0);

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
          // Backend responds with { success: true, count: N, data: [...] }
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
      {/* Hero / Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 mb-2">
            <span>Phase 8</span>
            <span>&bull;</span>
            <span>REST API Integration</span>
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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
