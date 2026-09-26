/**
 * Animated skeleton loader simulating product card placeholders.
 */
export const LoadingSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
        >
          {/* Card Top: Category & Stock Skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>

          {/* Product Image Placeholder Skeleton */}
          <div className="h-44 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl flex items-center justify-center">
            <svg
              className="w-10 h-10 text-slate-300 dark:text-slate-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Product Title Skeleton */}
          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/50 rounded" />
          </div>

          {/* Price & Action Skeleton */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
