import api from './api';

/**
 * Fetch all categories from the API.
 * 
 * @returns {Promise<Object>} API response { success: true, count: number, data: Category[] }
 */
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

/**
 * Fetch a single category by its ID.
 * 
 * @param {number|string} id - Category ID
 * @returns {Promise<Object>} API response { success: true, data: Category }
 */
export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

const categoryService = {
  getCategories,
  getCategoryById,
};

export default categoryService;
