import { formatCurrency } from '../utils/formatters';

/**
 * CartItem Component: Renders a single cart row with quantity controls, unit price, and subtotal.
 */
export const CartItem = ({ item, onUpdateQuantity, onRemove, disabled }) => {
  const { product, quantity, unit_price, subtotal } = item;
  const isMaxStock = quantity >= (product.stock || 999);

  return (
    <div
      data-testid={`cart-item-${item.id}`}
      className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-xs hover:border-slate-300 dark:hover:border-slate-700"
    >
      {/* Product Information */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {product.category_name || 'General'}
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Stock: {product.stock}
            </span>
          </div>

          <h4 className="text-base font-bold text-slate-900 dark:text-white truncate mt-0.5">
            {product.name}
          </h4>

          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Unit Price: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(unit_price)}</span>
          </div>
        </div>
      </div>

      {/* Quantity Controls & Subtotal */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        {/* Quantity Stepper */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 p-0.5">
            <button
              type="button"
              disabled={disabled || quantity <= 1}
              onClick={() => onUpdateQuantity(item.id, quantity - 1)}
              title="Decrease quantity"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
              </svg>
            </button>

            <span className="w-9 text-center text-xs font-bold text-slate-900 dark:text-white">
              {quantity}
            </span>

            <button
              type="button"
              disabled={disabled || isMaxStock}
              onClick={() => onUpdateQuantity(item.id, quantity + 1)}
              title={isMaxStock ? 'Max available stock reached' : 'Increase quantity'}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Subtotal */}
        <div className="text-right min-w-[90px]">
          <span className="block text-[11px] text-slate-400 font-medium">Subtotal</span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRemove(item.id)}
          title="Remove item"
          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors disabled:opacity-40"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
