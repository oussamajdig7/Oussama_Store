import api from './api';

/**
 * Place a new order from the authenticated user's current cart.
 * 
 * @param {Object} orderData - { shipping_address: string|Object }
 * @returns {Promise<Object>} API response { success: true, message: string, data: Order }
 */
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

/**
 * Fetch all orders placed by the authenticated user.
 * 
 * @returns {Promise<Object>} API response { success: true, count: number, data: Order[] }
 */
export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

/**
 * Fetch single order details by its ID.
 * 
 * @param {number|string} id - Order ID
 * @returns {Promise<Object>} API response { success: true, data: Order }
 */
export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

const orderService = {
  createOrder,
  getOrders,
  getOrderById,
};

export default orderService;
