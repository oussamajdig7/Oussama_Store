import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

/**
 * Custom hook to access shopping cart state and actions.
 * 
 * @returns {{
 *   cart: { items: Array, total_quantity: number, total: number },
 *   loading: boolean,
 *   error: string|null,
 *   addToCart: Function,
 *   updateQuantity: Function,
 *   removeItem: Function,
 *   clearCart: Function,
 *   refreshCart: Function
 * }}
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default useCart;
