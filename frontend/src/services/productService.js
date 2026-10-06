import api from './api';

/**
 * Fetch all products from the API.
 * 
 * @param {Object} [params] - Optional query parameters (e.g. category, search, page)
 * @returns {Promise<Object>} API response { success: true, count: number, data: Product[] }
 */
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

/**
 * Fetch a single product by its ID.
 * 
 * @param {number|string} id - Product ID
 * @returns {Promise<Object>} API response { success: true, data: Product }
 */
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

/**
 * Fetch a single product by its slug (SEO-friendly URL identifier).
 * 
 * @param {string} slug - Product Slug (e.g. 'iphone-15-pro')
 * @returns {Promise<Object>} API response { success: true, data: Product }
 */
export const getProductBySlug = async (slug) => {
  const response = await api.get(`/products/slug/${slug}`);
  return response.data;
};

/**
 * Fetch all gallery images for a specific product.
 * 
 * @param {number|string} id - Product ID
 * @returns {Promise<Object>} API response { success: true, count: number, data: Image[] }
 */
export const getProductImages = async (id) => {
  const response = await api.get(`/products/${id}/images`);
  return response.data;
};

const productService = {
  getProducts,
  getProductById,
  getProductBySlug,
  getProductImages,
};

export default productService;

