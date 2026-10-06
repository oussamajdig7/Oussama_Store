import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductBySlug } from '../services/productService';
import { useCart } from '../hooks/useCart';
import { formatCurrency, getStockBadge } from '../utils/formatters';
import { getFullImageUrl } from '../utils/imageUrl';
import WishlistButton from '../components/WishlistButton';
import ProductImageGallery from '../components/ProductImageGallery';
import SEO from '../components/SEO';
import LoadingSkeleton from '../components/LoadingSkeleton';
import NotFoundPage from './NotFoundPage';

/**
 * ProductDetailsPage:
 * Dedicated SEO-optimized product detail page for /products/:slug.
 *
 * Implements:
 * 1. Dynamic product-specific page title.
 * 2. Product-specific meta description.
 * 3. Product canonical URL.
 * 4. Open Graph metadata with product images.
 * 5. Twitter Card metadata.
 * 8. Product JSON-LD structured data conforming to Schema.org/Product.
 * 10. SEO-friendly slug route.
 * 11. Semantic HTML (<article>, <header>, <section>, <nav> breadcrumbs).
 * 12. Strict heading hierarchy (single <h1>, logical <h2>/<h3>).
 * 13. Descriptive image alt attributes.
 */
export const ProductDetailsPage = ({ onNavigateToCart }) => {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProductBySlug(slug);
        if (isMounted) {
          if (response?.success && response?.data) {
            setProduct(response.data);
          } else {
            setError('Product not found');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching product by slug:', err);
          setError(err?.response?.status === 404 ? 'Product not found' : 'Failed to load product details');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      fetchProduct();
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0 || adding) return;
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add product to cart:', err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 max-w-5xl mx-auto space-y-6">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (error || !product) {
    return <NotFoundPage />;
  }

  const stockBadge = getStockBadge(product.stock);
  const primaryImage = product.primary_image || (product.images && product.images[0]?.image_url);
  const fullImageUrl = primaryImage ? getFullImageUrl(primaryImage) : 'https://oussamastore.com/favicon.svg';
  const canonicalUrl = `https://oussamastore.com/products/${product.slug}`;
  const metaDescription = product.description
    ? (product.description.length > 160 ? `${product.description.substring(0, 157)}...` : product.description)
    : `Buy ${product.name} at Oussama Store. Price: ${formatCurrency(product.price)}. In stock with fast shipping and warranty.`;

  // Schema.org Product Structured Data
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: primaryImage ? [fullImageUrl] : [],
    description: product.description || `Buy ${product.name} at Oussama Store.`,
    sku: `PROD-${product.id}`,
    category: product.category_name || 'Electronics',
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'USD',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Oussama Store',
      },
    },
  };

  // BreadcrumbList Structured Data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://oussamastore.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category_name || 'Products',
        item: `https://oussamastore.com/?category=${product.category_slug || 'all'}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <SEO
        title={`${product.name} — Buy Online`}
        description={metaDescription}
        canonical={canonicalUrl}
        ogType="product"
        ogImage={fullImageUrl}
        structuredData={[productJsonLd, breadcrumbJsonLd]}
      />

      <div className="max-w-6xl mx-auto py-4 space-y-6">
        {/* Semantic Breadcrumbs Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 dark:text-slate-400">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">&bull;</li>
            <li>
              <Link
                to={`/?category=${product.category_slug || ''}`}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {product.category_name || 'Catalog'}
              </Link>
            </li>
            <li aria-hidden="true">&bull;</li>
            <li aria-current="page" className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Main Product Container */}
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Visual Media Section */}
            <section aria-label="Product Media" className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center justify-center min-h-[320px]">
                {primaryImage ? (
                  <img
                    src={fullImageUrl}
                    alt={`Photo of ${product.name}`}
                    className="max-h-80 w-auto object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {product.slug}
                    </span>
                  </div>
                )}
              </div>

              {/* Gallery Thumbnails if available */}
              {product.images && product.images.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Additional Views ({product.images.length})
                  </h3>
                  <ProductImageGallery
                    images={product.images}
                    productName={product.name}
                  />
                </div>
              )}
            </section>

            {/* Product Details Section */}
            <section aria-label="Product Information" className="space-y-6">
              <header className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                    {product.category_name || 'General'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${stockBadge.bg} ${stockBadge.color} ${stockBadge.border}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${stockBadge.dot}`} />
                      {stockBadge.label}
                    </span>
                    <WishlistButton productId={product.id} />
                  </div>
                </div>

                {/* Primary Page Heading */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-xs text-slate-400">USD &bull; Taxes included</span>
                </div>
              </header>

              {/* Product Overview */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Product Overview
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {product.description || 'No detailed description available for this item.'}
                </p>
              </div>

              {/* Key Specifications & Metadata */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                  Specifications &amp; Availability
                </h2>
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <dt className="text-slate-400 font-medium">SKU Reference</dt>
                    <dd className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      PROD-{product.id}
                    </dd>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <dt className="text-slate-400 font-medium">Inventory Stock</dt>
                    <dd className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {product.stock} units ready to ship
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Quantity Selector & Add to Cart Action */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
                {product.stock > 0 && (
                  <div className="flex items-center gap-3">
                    <label htmlFor="product-qty" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Quantity:
                    </label>
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 text-xs font-bold"
                        aria-label="Decrease quantity"
                      >
                        &minus;
                      </button>
                      <span id="product-qty" className="px-4 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        disabled={quantity >= product.stock}
                        className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 text-xs font-bold"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0 || adding}
                    className={`flex-1 w-full py-3 px-6 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                      justAdded
                        ? 'bg-emerald-600 text-white'
                        : product.stock <= 0
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 cursor-pointer'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Added to Cart ({quantity})</span>
                      </>
                    ) : adding ? (
                      <span>Adding to Cart...</span>
                    ) : product.stock <= 0 ? (
                      <span>Currently Out of Stock</span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add to Cart ({formatCurrency(product.price * quantity)})</span>
                      </>
                    )}
                  </button>

                  {onNavigateToCart && (
                    <button
                      type="button"
                      onClick={onNavigateToCart}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      View Cart
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>
        </article>
      </div>
    </>
  );
};

export default ProductDetailsPage;
