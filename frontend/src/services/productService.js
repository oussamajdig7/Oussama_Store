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

const productService = {
  getProducts,
  getProductById,
};

export default productService;
