import Navbar from '../components/Navbar';

/**
 * Main application layout with header, responsive container, and footer.
 */
export const MainLayout = ({ children, onRefresh, loading }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar onRefresh={onRefresh} loading={loading} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Oussama Store. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>React + Vite</span>
            <span>&bull;</span>
            <span>Express.js REST API</span>
            <span>&bull;</span>
            <span>SQLite Database</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
