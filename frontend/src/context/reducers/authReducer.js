/**
 * Action types for Authentication reducer
 */
export const AUTH_ACTIONS = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
};

/**
 * Initial state separating server data (user) from UI status (loading, error)
 */
export const initialAuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

/**
 * Pure reducer managing authentication state transitions
 */
export function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: Boolean(action.payload),
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.AUTH_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload || null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: Boolean(action.payload),
        loading: false,
      };

    default:
      return state;
  }
}

export default authReducer;
