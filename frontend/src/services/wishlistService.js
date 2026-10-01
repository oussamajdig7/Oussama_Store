import api from './api';

/**
 * Fetch the authenticated user's current wishlist.
 * 
 * @returns {Promise<Object>} API response { success: true, count: number, data: Array }
 */
export const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

/**
 * Add a product to the user's wishlist.
 * 
 * @param {number|string} productId - ID of the product
 * @returns {Promise<Object>} API response
 */
export const addToWishlist = async (productId) => {
  const response = await api.post('/wishlist', {
    product_id: Number(productId),
  });
  return response.data;
};

/**
 * Remove a product from the user's wishlist.
 * 
 * @param {number|string} productId - ID of the product
 * @returns {Promise<Object>} API response
 */
export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};

export default wishlistService;
