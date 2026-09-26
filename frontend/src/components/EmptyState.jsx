/**
 * Empty state display when no products are found.
 */
export const EmptyState = ({ title = 'No Products Found', description = 'There are currently no products available in the catalog.', onReset }) => {
  return (
    <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        {description}
      </p>

      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default EmptyState;
