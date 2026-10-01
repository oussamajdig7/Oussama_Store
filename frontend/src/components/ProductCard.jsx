import { useState } from 'react';
import { formatCurrency, getStockBadge } from '../utils/formatters';
import WishlistButton from './WishlistButton';

/**
 * Premium Product Card displaying name, price, stock status, category and Add to Cart action.
 */
export const ProductCard = ({ product, onAddToCart }) => {
  const stockBadge = getStockBadge(product.stock);
  const categoryName = product.category_name || 'General';
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

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
        <div className="h-44 w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-800/80 rounded-xl mb-4 flex flex-col items-center justify-center p-4 border border-slate-100 dark:border-slate-800/60 group-hover:scale-[1.01] transition-transform duration-300">
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
    </article>
  );
};

export default ProductCard;
