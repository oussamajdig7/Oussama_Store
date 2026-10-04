/**
 * Resolve full URL for images stored in the backend static uploads directory.
 * 
 * @param {string} relativeUrl - E.g. "/uploads/products/p1-123.jpg"
 * @returns {string|null} - Absolute URL for img src
 */
export const getFullImageUrl = (relativeUrl) => {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://') || relativeUrl.startsWith('data:')) {
    return relativeUrl;
  }
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseHost = apiUrl.replace(/\/api\/?$/, '');
  const cleanPath = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
  return `${baseHost}${cleanPath}`;
};

export default getFullImageUrl;
