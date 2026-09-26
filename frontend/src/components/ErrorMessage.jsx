/**
 * Modern error state banner with retry button.
 */
export const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="max-w-2xl mx-auto my-12 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
      <div className="w-14 h-14 mx-auto mb-4 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center">
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        Failed to Load Products
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
        {message || 'Unable to connect to the product API. Please check your backend connection.'}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retry Connection
          </button>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        API Endpoint configured: <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">{import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</code>
      </div>
    </div>
  );
};

export default ErrorMessage;
