import api from './api';

/**
 * Fetch the authenticated user's current shopping cart.
 * 
 * @returns {Promise<Object>} API response { success: true, count: number, data: { items, total_quantity, total } }
 */
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

/**
 * Add a product to the user's cart (or increment quantity if already exists).
 * 
 * @param {number|string} productId - ID of the product
 * @param {number} [quantity=1] - Quantity to add
 * @returns {Promise<Object>} API response with updated cart details
 */
export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post('/cart', {
    product_id: Number(productId),
    quantity: Number(quantity),
  });
  return response.data;
};

/**
 * Update the quantity of a specific cart item.
 * 
 * @param {number|string} cartItemId - ID of the cart item
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} API response with updated cart details
 */
export const updateCartItem = async (cartItemId, quantity) => {
  const response = await api.put(`/cart/${cartItemId}`, {
    quantity: Number(quantity),
  });
  return response.data;
};

/**
 * Remove a single item from the cart.
 * 
 * @param {number|string} cartItemId - ID of the cart item to delete
 * @returns {Promise<Object>} API response
 */
export const removeCartItem = async (cartItemId) => {
  const response = await api.delete(`/cart/${cartItemId}`);
  return response.data;
};

/**
 * Clear the entire shopping cart for the authenticated user.
 * 
 * @returns {Promise<Object>} API response
 */
export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
};

const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};

export default cartService;
