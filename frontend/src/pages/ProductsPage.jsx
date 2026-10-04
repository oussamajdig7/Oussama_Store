import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { useCart } from '../hooks/useCart';
import ProductCard from '../components/ProductCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../utils/formatters';

/**
 * ProductsPage:
 * Live catalog with parameterized search, category filtering, price range filter,
 * sorting options (price_asc, price_desc, newest, oldest), and synchronized URL query parameters.
 */
export const ProductsPage = ({ refreshTrigger = 0, onNavigateToCart }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract filters from URL query parameters
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || 'all';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  // Local state for smooth debounced search and price inputs
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);
  const [showPriceFilter, setShowPriceFilter] = useState(Boolean(currentMinPrice || currentMaxPrice));

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [localTrigger, setLocalTrigger] = useState(0);

  const { addToCart } = useCart();

  // Sync local inputs when URL parameters change externally (e.g. back/forward navigation)
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
    if (currentMinPrice || currentMaxPrice) {
      setShowPriceFilter(true);
    }
  }, [currentMinPrice, currentMaxPrice]);

  // Load categories once on mount
  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        const catRes = await getCategories();
        if (isMounted && catRes && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        }
      } catch (err) {
        console.warn('Failed to load categories:', err);
      }
    };
    fetchCats();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch products from backend whenever URL filters change
  useEffect(() => {
    let isMounted = true;

    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {};
        if (currentSearch.trim()) params.search = currentSearch.trim();
        if (currentCategory && currentCategory !== 'all') params.category = currentCategory;
        if (currentMinPrice !== '') params.minPrice = currentMinPrice;
        if (currentMaxPrice !== '') params.maxPrice = currentMaxPrice;
        if (currentSort && currentSort !== 'newest') params.sort = currentSort;

        const response = await getProducts(params);
        if (isMounted) {
          setProducts(Array.isArray(response?.data) ? response.data : []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching products:', err);
          setError(
            err.userMessage ||
              'Failed to load products from API. Please verify the Express backend server is running on port 5000.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFilteredProducts();

    return () => {
      isMounted = false;
    };
  }, [
    currentSearch,
    currentCategory,
    currentMinPrice,
    currentMaxPrice,
    currentSort,
    refreshTrigger,
    localTrigger,
  ]);

  // Synchronize URL query params
  const updateUrlFilters = useCallback(
    (newParams) => {
      const current = Object.fromEntries(searchParams.entries());
      const merged = { ...current, ...newParams };

      // Clean empty and default values from URL
      Object.keys(merged).forEach((key) => {
        if (
          merged[key] === '' ||
          merged[key] === null ||
          merged[key] === undefined ||
          (key === 'category' && merged[key] === 'all') ||
          (key === 'sort' && merged[key] === 'newest')
        ) {
          delete merged[key];
        }
      });

      setSearchParams(merged, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Debounce search input to avoid spamming the backend
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateUrlFilters({ search: searchInput });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, currentSearch, updateUrlFilters]);

  // Category change handler
  const handleCategorySelect = (slug) => {
    updateUrlFilters({ category: slug });
  };

  // Sort change handler
  const handleSortChange = (e) => {
    updateUrlFilters({ sort: e.target.value });
  };

  // Price range apply handler
  const handleApplyPrice = (e) => {
    e.preventDefault();
    updateUrlFilters({
      minPrice: minPriceInput.trim(),
      maxPrice: maxPriceInput.trim(),
    });
  };

  // Preset price range helper
  const handlePricePreset = (min, max) => {
    setMinPriceInput(min !== null ? String(min) : '');
    setMaxPriceInput(max !== null ? String(max) : '');
    updateUrlFilters({
      minPrice: min !== null ? String(min) : '',
      maxPrice: max !== null ? String(max) : '',
    });
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setShowPriceFilter(false);
    setSearchParams({}, { replace: true });
  };

  // Active filters count
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      currentSearch.trim() ||
      (currentCategory && currentCategory !== 'all') ||
      currentMinPrice ||
      currentMaxPrice ||
      (currentSort && currentSort !== 'newest')
    );
  }, [currentSearch, currentCategory, currentMinPrice, currentMaxPrice, currentSort]);

  // Handle Add to Cart action
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

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    setLocalTrigger((prev) => prev + 1);
  }, []);

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
              className="ml-3 underline hover:no-underline font-bold text-emerald-700 dark:text-emerald-300 cursor-pointer"
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
            <span>Phase 14</span>
            <span>&bull;</span>
            <span>Search &amp; Dynamic Filters</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Products Catalog
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-500 dark:text-slate-400">
            Search, filter by category &amp; price range, and sort products in real time.
          </p>
        </div>

        {/* Live Count Badge */}
        {!loading && !error && (
          <div className="flex items-center gap-2 self-start md:self-auto text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>
              {products.length} {products.length === 1 ? 'Product' : 'Products'} found
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Control Toolbar */}
      <div className="space-y-4">
        {/* Top Controls: Search Bar, Price Toggle, Sorting */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-2xs"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  updateUrlFilters({ search: '' });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          {/* Action Row: Price Filter Button & Sorting Dropdown */}
          <div className="flex items-center gap-2.5">
            {/* Price Filter Toggle Button */}
            <button
              onClick={() => setShowPriceFilter((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showPriceFilter || currentMinPrice || currentMaxPrice
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Price Filter</span>
              {(currentMinPrice || currentMaxPrice) && (
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
              )}
            </button>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-2xs">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <select
                value={currentSort}
                onChange={handleSortChange}
                className="bg-transparent text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1"
                aria-label="Sort products"
              >
                <option value="newest" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  Newest Arrivals
                </option>
                <option value="price_asc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  Price: Low to High
                </option>
                <option value="price_desc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  Price: High to Low
                </option>
                <option value="oldest" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  Oldest First
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Collapsible Price Filter Panel */}
        {showPriceFilter && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
            <form onSubmit={handleApplyPrice} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  Price Range ($):
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Min"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <span className="text-slate-400 text-xs">to</span>
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Max"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-slate-400 text-[11px] font-medium mr-1 hidden md:inline">Presets:</span>
                <button
                  type="button"
                  onClick={() => handlePricePreset(null, 500)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium whitespace-nowrap cursor-pointer"
                >
                  Under $500
                </button>
                <button
                  type="button"
                  onClick={() => handlePricePreset(500, 1500)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium whitespace-nowrap cursor-pointer"
                >
                  $500 &ndash; $1,500
                </button>
                <button
                  type="button"
                  onClick={() => handlePricePreset(1500, null)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium whitespace-nowrap cursor-pointer"
                >
                  Over $1,500
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isSelected =
              currentCategory === cat.slug || String(currentCategory) === String(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug || cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Active Filters Bar & Reset Action */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-medium">Active filters:</span>

            {/* Search Chip */}
            {currentSearch && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-700">
                <span>Search: "{currentSearch}"</span>
                <button
                  onClick={() => {
                    setSearchInput('');
                    updateUrlFilters({ search: '' });
                  }}
                  className="hover:text-rose-500 font-bold ml-0.5 cursor-pointer"
                >
                  &times;
                </button>
              </span>
            )}

            {/* Category Chip */}
            {currentCategory && currentCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-800">
                <span>
                  Category:{' '}
                  {categories.find(
                    (c) => c.slug === currentCategory || String(c.id) === String(currentCategory)
                  )?.name || currentCategory}
                </span>
                <button
                  onClick={() => updateUrlFilters({ category: 'all' })}
                  className="hover:text-rose-500 font-bold ml-0.5 cursor-pointer"
                >
                  &times;
                </button>
              </span>
            )}

            {/* Price Chip */}
            {(currentMinPrice || currentMaxPrice) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800">
                <span>
                  Price:{' '}
                  {currentMinPrice ? formatCurrency(currentMinPrice) : '$0'} &ndash;{' '}
                  {currentMaxPrice ? formatCurrency(currentMaxPrice) : 'Any'}
                </span>
                <button
                  onClick={() => {
                    setMinPriceInput('');
                    setMaxPriceInput('');
                    updateUrlFilters({ minPrice: '', maxPrice: '' });
                  }}
                  className="hover:text-rose-500 font-bold ml-0.5 cursor-pointer"
                >
                  &times;
                </button>
              </span>
            )}

            {/* Sort Chip if non-default */}
            {currentSort && currentSort !== 'newest' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                <span>
                  Sort:{' '}
                  {currentSort === 'price_asc'
                    ? 'Price: Low to High'
                    : currentSort === 'price_desc'
                    ? 'Price: High to Low'
                    : 'Oldest'}
                </span>
                <button
                  onClick={() => updateUrlFilters({ sort: 'newest' })}
                  className="hover:text-rose-500 font-bold ml-0.5 cursor-pointer"
                >
                  &times;
                </button>
              </span>
            )}

            {/* Clear All Filters Button */}
            <button
              onClick={handleClearAllFilters}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer ml-1"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Main Catalog View: Loading Skeleton, Error, Empty State, or Product Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={handleRetry} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No Products Found"
          description={
            hasActiveFilters
              ? 'No products matched your active search, category, or price filters.'
              : 'The catalog is currently empty.'
          }
          onReset={hasActiveFilters ? handleClearAllFilters : undefined}
          resetLabel="Clear Filters"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
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
