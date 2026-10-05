/**
 * Action types for Wishlist reducer
 */
export const WISHLIST_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_WISHLIST: 'SET_WISHLIST',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_WISHLIST: 'CLEAR_WISHLIST',
  SET_ERROR: 'SET_ERROR',
};

/**
 * Initial state separating server data (items) from UI state (loading, error)
 */
export const initialWishlistState = {
  items: [],
  loading: false,
  error: null,
};

/**
 * Pure reducer managing wishlist state
 */
export function wishlistReducer(state, action) {
  switch (action.type) {
    case WISHLIST_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload !== undefined ? Boolean(action.payload) : true,
        error: action.payload ? null : state.error,
      };

    case WISHLIST_ACTIONS.SET_WISHLIST:
      return {
        ...state,
        items: Array.isArray(action.payload) ? action.payload : [],
        loading: false,
        error: null,
      };

    case WISHLIST_ACTIONS.ADD_ITEM: {
      const newItem = action.payload;
      if (!newItem) return state;

      // Prevent duplicate insertion in local state
      const alreadyExists = state.items.some(
        (item) => Number(item.product_id) === Number(newItem.product_id)
      );
      if (alreadyExists) {
        return { ...state, loading: false };
      }

      return {
        ...state,
        items: [newItem, ...state.items],
        loading: false,
        error: null,
      };
    }

    case WISHLIST_ACTIONS.REMOVE_ITEM: {
      const targetId = Number(action.payload);
      return {
        ...state,
        items: state.items.filter(
          (item) => Number(item.product_id) !== targetId && Number(item.id) !== targetId
        ),
        loading: false,
        error: null,
      };
    }

    case WISHLIST_ACTIONS.CLEAR_WISHLIST:
      return {
        ...state,
        items: [],
        loading: false,
        error: null,
      };

    case WISHLIST_ACTIONS.SET_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload || null,
      };

    default:
      return state;
  }
}

export default wishlistReducer;
