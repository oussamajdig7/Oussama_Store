import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Oussama Store';
const DEFAULT_TITLE = 'Oussama Store — Premium Tech & Electronics';
const DEFAULT_DESCRIPTION =
  'Discover premium smartphones, laptops, audio gear, and smart accessories at Oussama Store with fast shipping, manufacturer warranty, and secure checkout.';
const DEFAULT_IMAGE = 'https://oussamastore.com/favicon.svg';
const DEFAULT_URL = 'https://oussamastore.com';

/**
 * Reusable SEO component using react-helmet-async.
 *
 * Provides:
 * - Dynamic page titles with brand template
 * - Meta descriptions
 * - Canonical link tag
 * - Open Graph metadata (og:title, og:description, og:image, og:url, og:type, og:site_name)
 * - Twitter Card metadata (twitter:card, twitter:title, twitter:description, twitter:image)
 * - Robots indexing control (noindex, nofollow)
 * - Schema.org JSON-LD structured data (Product, Organization, WebSite)
 * - Deduplication via react-helmet-async
 */
export const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noindex = false,
  structuredData = null,
}) => {
  // Format title: if specific page title provided, append brand; otherwise use default
  const formattedTitle = title
    ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`)
    : DEFAULT_TITLE;

  // Resolve canonical URL
  const resolvedCanonical = canonical
    ? (canonical.startsWith('http') ? canonical : `${DEFAULT_URL}${canonical.startsWith('/') ? '' : '/'}${canonical}`)
    : (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : DEFAULT_URL);

  // Resolve absolute image URL for OG/Twitter cards
  const resolvedImage = ogImage.startsWith('http')
    ? ogImage
    : (typeof window !== 'undefined' ? `${window.location.origin}${ogImage.startsWith('/') ? '' : '/'}${ogImage}` : `${DEFAULT_URL}${ogImage}`);

  return (
    <Helmet>
      {/* 1. Dynamic Page Title */}
      <title>{formattedTitle}</title>

      {/* 2. Meta Description */}
      <meta name="description" content={description} />

      {/* 3. Canonical Link */}
      <link rel="canonical" href={resolvedCanonical} />

      {/* Robots Directive */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* 4. Open Graph Metadata */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:image" content={resolvedImage} />

      {/* 5. Twitter Card Metadata */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />

      {/* 8 & 9. Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
