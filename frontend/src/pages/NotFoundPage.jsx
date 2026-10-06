import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

/**
 * 404 Not Found Page.
 *
 * Implements:
 * - Dynamic 404 page title
 * - noindex, nofollow meta tag (SEO safe)
 * - Semantic HTML (<section>, <h1>, <p>, navigation actions)
 * - Clear UX back to the catalog
 */
export const NotFoundPage = () => {
  return (
    <>
      <SEO
        title="404 - Page Not Found"
        description="The page you are looking for does not exist or has been moved. Explore our catalog of electronics at Oussama Store."
        noindex={true}
      />

      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <section className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900">
              Error 404
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Page Not Found
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Sorry, we couldn't find the page you were looking for. The link might be broken or the product may no longer be available.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Back to Store</span>
            </Link>

            <Link
              to="/cart"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>View Cart</span>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default NotFoundPage;
