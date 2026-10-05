/**
 * Action types for Cart reducer
 */
export const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_CART: 'SET_CART',
  CLEAR_CART: 'CLEAR_CART',
  SET_ERROR: 'SET_ERROR',
};

/**
 * Default empty cart data schema matching backend getCartDataForUser
 */
export const DEFAULT_CART_DATA = {
  items: [],
  total_quantity: 0,
  total: 0,
};

/**
 * Initial state separating server data (cart) from UI state (loading, error)
 */
export const initialCartState = {
  cart: DEFAULT_CART_DATA,
  loading: false,
  error: null,
};

/**
 * Pure reducer managing shopping cart state
 */
export function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload !== undefined ? Boolean(action.payload) : true,
        error: action.payload ? null : state.error,
      };

    case CART_ACTIONS.SET_CART:
      return {
        ...state,
        cart: action.payload || DEFAULT_CART_DATA,
        loading: false,
        error: null,
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        cart: DEFAULT_CART_DATA,
        loading: false,
        error: null,
      };

    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload || null,
      };

    default:
      return state;
  }
}

export default cartReducer;
