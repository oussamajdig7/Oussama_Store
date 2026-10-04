/**
 * Pagination component supporting Previous, Next, numeric pages, ellipsis,
 * disabled states, and loading states for server-side pagination.
 *
 * @param {number} currentPage - Current active 1-indexed page
 * @param {number} totalPages - Total available pages
 * @param {number} totalItems - Total matching records
 * @param {number} limit - Items per page
 * @param {boolean} loading - Loading indicator
 * @param {function} onPageChange - Callback when a new page is clicked
 */
export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  limit = 12,
  loading = false,
  onPageChange,
  onLimitChange,
}) => {
  // If there are no items at all, don't render pagination controls
  if (totalItems <= 0) {
    return null;
  }

  // Calculate visible page numbers with smart ellipsis windowing
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  const isPrevDisabled = currentPage <= 1 || loading;
  const isNextDisabled = currentPage >= totalPages || loading;

  return (
    <nav
      aria-label="Products catalog pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 select-none"
    >
      {/* Result counter summary and optional items per page */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {loading && (
            <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          )}
          <span>
            Showing <strong className="text-slate-900 dark:text-white font-semibold">{startItem}</strong> to{' '}
            <strong className="text-slate-900 dark:text-white font-semibold">{endItem}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white font-semibold">{totalItems}</strong> products
          </span>
        </div>

        {onLimitChange && (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="text-[11px] hidden sm:inline">Per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              disabled={loading}
              aria-label="Items per page"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <option value="6">6</option>
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          disabled={isPrevDisabled}
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-900 cursor-pointer shadow-2xs"
          aria-label="Previous Page"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageItem, index) => {
            if (pageItem === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-slate-400 font-mono tracking-widest text-[11px]"
                >
                  &hellip;
                </span>
              );
            }

            const isActive = pageItem === currentPage;

            return (
              <button
                key={pageItem}
                type="button"
                disabled={loading}
                onClick={() => onPageChange && onPageChange(pageItem)}
                className={`min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Go to page ${pageItem}`}
              >
                {pageItem}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={isNextDisabled}
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-900 cursor-pointer shadow-2xs"
          aria-label="Next Page"
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
