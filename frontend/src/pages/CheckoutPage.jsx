import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { createOrder } from '../services/orderService';
import { formatCurrency } from '../utils/formatters';
import SEO from '../components/SEO';

/**
 * CheckoutPage: Collects shipping address, reviews order summary, and completes checkout.
 */
export const CheckoutPage = ({ onOrderSuccess, onNavigateToCart }) => {
  const { cart, refreshCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Morocco',
    phone: '',
    notes: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.fullName.trim() || !formData.street.trim() || !formData.city.trim() || !formData.phone.trim()) {
      setError('Please fill in all required shipping address fields.');
      return;
    }

    setSubmitting(true);
    try {
      const addressString = `${formData.fullName}, ${formData.street}, ${formData.city} ${formData.postalCode}, ${formData.country} (Tel: ${formData.phone})${formData.notes ? ` - Note: ${formData.notes}` : ''}`;

      const response = await createOrder({
        shipping_address: addressString,
      });

      if (response && response.data) {
        await refreshCart();
        onOrderSuccess(response.data);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.userMessage || 'Failed to place order. Please verify items and available stock.');
    } finally {
      setSubmitting(false);
    }
  };

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <>
        <SEO
          title="Checkout"
          description="Secure checkout at Oussama Store."
          noindex={true}
        />
        <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Your Cart is Empty
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Add some products to your cart before proceeding to checkout.
          </p>
          <button
            type="button"
            onClick={onNavigateToCart}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            View Cart
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Secure Checkout"
        description="Provide your delivery details to place your order securely with server-side validation at Oussama Store."
        noindex={true}
      />
      <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 mb-2">
          <span>Phase 11</span>
          <span>&bull;</span>
          <span>Checkout &amp; Order Creation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Provide your delivery details to place your order. Prices and stock will be verified securely by the server.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-sm text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Shipping Address & Payment Selection */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Shipping Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Oussama Jdigo"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="e.g. 45 Boulevard d'Anfa, Apt 12"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Casablanca"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Postal Code / ZIP
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="e.g. 20000"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +212 600 000 000"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  name="notes"
                  rows="2"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="e.g. Ring the second doorbell on the left"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Simple Fake Payment Method */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Payment Method</span>
            </h2>

            <div className="p-4 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full border-4 border-indigo-600 bg-white" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Cash on Delivery / Simple Checkout
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pay securely in cash or card when your package is delivered
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Items Summary & Action */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm sticky top-24 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Order Review ({cart.total_quantity} items)
          </h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="min-w-0 flex-1 pr-3">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {item.product.name}
                  </div>
                  <div className="text-slate-400">
                    Qty: {item.quantity} &times; {formatCurrency(item.unit_price)}
                  </div>
                </div>
                <div className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
                  {formatCurrency(item.subtotal)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(cart.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">Free</span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline text-sm">
              <span className="font-bold text-slate-900 dark:text-white">Total</span>
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
                {formatCurrency(cart.total)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Placing Order (Atomic Transaction)...</span>
            ) : (
              <>
                <span>Confirm &amp; Place Order</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>

          <div className="text-[11px] text-center text-slate-400">
            Stock will be automatically deducted from the database in an atomic transaction.
          </div>
        </div>
      </form>
    </div>
    </>
  );
};

export default CheckoutPage;
