import { useState } from 'react';
import { formatCurrency, getStockBadge } from '../utils/formatters';
import WishlistButton from './WishlistButton';
import ProductImageGallery from './ProductImageGallery';
import { getFullImageUrl } from '../utils/imageUrl';

/**
 * Premium Product Card displaying name, price, stock status, category and Add to Cart action.
 */
export const ProductCard = ({ product, onAddToCart }) => {
  const stockBadge = getStockBadge(product.stock);
  const categoryName = product.category_name || 'General';
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const primaryImage = product.primary_image || (product.images && product.images[0]?.image_url);
  const hasMultipleImages = product.images && product.images.length > 1;

  const handleAdd = async () => {
    if (!onAddToCart || product.stock <= 0) return;
    setAdding(true);
    try {
      await onAddToCart(product.id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article
      data-testid={`product-card-${product.id}`}
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Category, Stock Status & Wishlist Button */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
            {categoryName}
          </span>

          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${stockBadge.bg} ${stockBadge.color} ${stockBadge.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${stockBadge.dot}`} />
              {stockBadge.label}
            </span>
            <WishlistButton productId={product.id} />
          </div>
        </div>

        {/* Product Visual Area */}
        <div
          onClick={() => setIsGalleryOpen(true)}
          className="relative h-44 w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-800/80 rounded-xl mb-4 flex flex-col items-center justify-center p-2 border border-slate-100 dark:border-slate-800/60 overflow-hidden cursor-pointer group-hover:scale-[1.01] transition-transform duration-300"
          title="Click to view product image gallery"
        >
          {primaryImage ? (
            <img
              src={getFullImageUrl(primaryImage)}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {product.slug || 'product'}
              </span>
            </div>
          )}

          {/* Photo Gallery Indicator Badge */}
          {hasMultipleImages && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/70 text-white backdrop-blur-xs flex items-center gap-1 shadow-sm">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{product.images.length}</span>
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Product Description */}
        {product.description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
            {product.description}
          </p>
        )}
      </div>

      {/* Card Footer: Price & Add to Cart Action */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <span className="block text-xs text-slate-400 dark:text-slate-500 font-medium">
              Price
            </span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(product.price)}
            </span>
          </div>

          <div className="text-right">
            <span className="block text-xs text-slate-400 dark:text-slate-500 font-medium">
              Available
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {product.stock} units
            </span>
          </div>
        </div>

        {onAddToCart && (
          <button
            type="button"
            disabled={product.stock <= 0 || adding}
            onClick={handleAdd}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : product.stock <= 0
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
            }`}
          >
            {justAdded ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Added to Cart</span>
              </>
            ) : adding ? (
              <span>Adding...</span>
            ) : product.stock <= 0 ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add to Cart</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Product Image Gallery Modal (Phase 13) */}
      {isGalleryOpen && (
        <div
          onClick={() => setIsGalleryOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {product.name}
                </h3>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  {categoryName} &bull; {formatCurrency(product.price)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <ProductImageGallery
              images={
                product.images && product.images.length > 0
                  ? product.images
                  : primaryImage
                  ? [{ id: 1, image_url: primaryImage }]
                  : []
              }
              productName={product.name}
            />

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close Gallery
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default ProductCard;
