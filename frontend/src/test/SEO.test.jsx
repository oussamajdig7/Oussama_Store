import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SEO from '../components/SEO';
import NotFoundPage from '../pages/NotFoundPage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import * as productService from '../services/productService';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';

vi.mock('../services/productService', () => ({
  getProductBySlug: vi.fn(),
  getProducts: vi.fn(),
  getProductById: vi.fn(),
  getProductImages: vi.fn(),
}));

describe('SEO Component & Meta Optimization', () => {
  let helmetContext;

  beforeEach(() => {
    helmetContext = {};
    vi.clearAllMocks();
  });

  const renderWithHelmet = (ui) => {
    return render(
      <HelmetProvider context={helmetContext}>
        <MemoryRouter>
          {ui}
        </MemoryRouter>
      </HelmetProvider>
    );
  };

  it('renders dynamic title, description, canonical, and Open Graph tags', async () => {
    renderWithHelmet(
      <SEO
        title="iPhone 15 Pro — Buy Online"
        description="Experience the titanium iPhone 15 Pro with A17 Pro chip."
        canonical="https://oussamastore.com/products/iphone-15-pro"
        ogType="product"
        ogImage="https://oussamastore.com/uploads/iphone15.jpg"
      />
    );

    // 1. Dynamic Page Title
    await waitFor(() => {
      expect(document.title).toBe('iPhone 15 Pro — Buy Online | Oussama Store');
    });

    // 2. Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    expect(metaDesc).not.toBeNull();
    expect(metaDesc?.getAttribute('content')).toBe('Experience the titanium iPhone 15 Pro with A17 Pro chip.');

    // 3. Canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    expect(canonicalLink).not.toBeNull();
    expect(canonicalLink?.getAttribute('href')).toBe('https://oussamastore.com/products/iphone-15-pro');

    // 4. Open Graph metadata
    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle?.getAttribute('content')).toBe('iPhone 15 Pro — Buy Online | Oussama Store');

    const ogType = document.querySelector('meta[property="og:type"]');
    expect(ogType?.getAttribute('content')).toBe('product');

    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage?.getAttribute('content')).toBe('https://oussamastore.com/uploads/iphone15.jpg');

    // 5. Twitter Card metadata
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image');
  });

  it('renders JSON-LD structured data correctly', async () => {
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'iPhone 15 Pro',
      sku: 'PROD-1',
      offers: {
        '@type': 'Offer',
        price: 999,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    };

    renderWithHelmet(
      <SEO
        title="iPhone 15 Pro"
        structuredData={productSchema}
      />
    );

    await waitFor(() => {
      const scriptTag = document.querySelector('script[type="application/ld+json"]');
      expect(scriptTag).not.toBeNull();
      const json = JSON.parse(scriptTag?.textContent || '{}');
      expect(json['@type']).toBe('Product');
      expect(json.name).toBe('iPhone 15 Pro');
      expect(json.offers?.price).toBe(999);
    });
  });

  it('applies noindex, nofollow robots directive when noindex is set', async () => {
    renderWithHelmet(
      <SEO
        title="Checkout"
        description="Secure checkout"
        noindex={true}
      />
    );

    await waitFor(() => {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      expect(robotsMeta).not.toBeNull();
      expect(robotsMeta?.getAttribute('content')).toBe('noindex, nofollow');
    });
  });

  it('renders 404 page with semantic heading, recovery navigation, and noindex tag', async () => {
    renderWithHelmet(<NotFoundPage />);

    // 11 & 12. Semantic HTML & proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/page not found/i);
    expect(screen.getByText(/error 404/i)).toBeInTheDocument();

    // 15. Action buttons back to store
    expect(screen.getByRole('link', { name: /back to store/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /view cart/i })).toHaveAttribute('href', '/cart');

    // SEO noindex on 404
    await waitFor(() => {
      expect(document.title).toContain('404 - Page Not Found');
      const robotsMeta = document.querySelector('meta[name="robots"]');
      expect(robotsMeta?.getAttribute('content')).toBe('noindex, nofollow');
    });
  });

  it('renders ProductDetailsPage with unique metadata, canonical URL, and product JSON-LD', async () => {
    vi.mocked(productService.getProductBySlug).mockResolvedValueOnce({
      success: true,
      data: {
        id: 1,
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'Titanium design with A17 Pro chip and customizable Action button.',
        price: 999.0,
        stock: 12,
        category_name: 'Smartphones',
        category_slug: 'smartphones',
        primary_image: '/uploads/iphone-15.jpg',
        images: [{ id: 1, image_url: '/uploads/iphone-15.jpg' }],
      },
    });

    render(
      <HelmetProvider context={helmetContext}>
        <MemoryRouter initialEntries={['/products/iphone-15-pro']}>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Routes>
                  <Route path="/products/:slug" element={<ProductDetailsPage />} />
                </Routes>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </MemoryRouter>
      </HelmetProvider>
    );

    // Verify product heading (single h1)
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('iPhone 15 Pro');

    // Verify dynamic SEO metadata
    await waitFor(() => {
      expect(document.title).toBe('iPhone 15 Pro — Buy Online | Oussama Store');

      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical?.getAttribute('href')).toBe('https://oussamastore.com/products/iphone-15-pro');

      const desc = document.querySelector('meta[name="description"]');
      expect(desc?.getAttribute('content')).toContain('Titanium design with A17 Pro chip');

      const scriptTags = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      const productSchemaText = scriptTags.map((s) => s.textContent).join(' ');
      expect(productSchemaText).toContain('PROD-1');
      expect(productSchemaText).toContain('"price":999');
      expect(productSchemaText).toContain('"@type":"Product"');
    });
  });
});

