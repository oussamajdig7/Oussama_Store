/**
 * Format a numeric price into a currency string (default USD).
 * 
 * @param {number|string} price 
 * @param {string} [currency='USD'] 
 * @param {string} [locale='en-US'] 
 * @returns {string} Formatted price string (e.g. "$1,199.99")
 */
export const formatCurrency = (price, currency = 'USD', locale = 'en-US') => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numericPrice)) return '$0.00';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(numericPrice);
};

/**
 * Get human-readable status badge info based on product stock.
 * 
 * @param {number} stock 
 * @returns {{ label: string, color: string, bg: string, border: string, isInStock: boolean }}
 */
export const getStockBadge = (stock) => {
  if (stock <= 0) {
    return {
      label: 'Out of Stock',
      color: 'text-rose-700 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-800',
      dot: 'bg-rose-500',
      isInStock: false,
    };
  }

  if (stock <= 5) {
    return {
      label: `Low Stock (${stock} left)`,
      color: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-500',
      isInStock: true,
    };
  }

  return {
    label: `In Stock (${stock})`,
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    isInStock: true,
  };
};
