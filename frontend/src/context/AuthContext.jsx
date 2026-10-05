/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import {
  getCurrentUser,
  login as apiLogin,
  register as apiRegister,
  logout as authLogout,
  getToken,
} from '../services/authService';
import {
  authReducer,
  AUTH_ACTIONS,
  initialAuthState,
} from './reducers/authReducer';

// Re-export reducer constants and function for testing and modularity
export { authReducer, AUTH_ACTIONS, initialAuthState };

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Initialize authentication on mount from existing token without unnecessary duplicate calls
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        if (isMounted) {
          dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: null });
        }
        return;
      }

      dispatch({ type: AUTH_ACTIONS.AUTH_START });
      try {
        const response = await getCurrentUser();
        if (isMounted && response?.data) {
          dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: response.data });
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        authLogout();
        if (isMounted) {
          dispatch({
            type: AUTH_ACTIONS.AUTH_FAILURE,
            payload: err.userMessage || 'Session expired. Please sign in again.',
          });
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login handler
  const login = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });
    try {
      const response = await apiLogin(credentials);
      const user = response?.data?.user;
      if (user) {
        dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: user });
      }
      return response;
    } catch (err) {
      const errorMsg = err.userMessage || 'Invalid email or password.';
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: errorMsg });
      throw err;
    }
  }, []);

  // Registration handler
  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });
    try {
      const response = await apiRegister(userData);
      const user = response?.data?.user;
      if (user) {
        dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: user });
      }
      return response;
    } catch (err) {
      const errorMsg = err.userMessage || 'Registration failed. Please try again.';
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: errorMsg });
      throw err;
    }
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    authLogout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  // Set user directly (e.g. after profile update)
  const setUser = useCallback((user) => {
    dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
  }, []);

  // Memoize context value to prevent unneeded re-renders
  const contextValue = useMemo(
    () => ({
      // Current user
      user: state.user,
      currentUser: state.user,
      // Authentication state
      isAuthenticated: state.isAuthenticated,
      // Loading & error state
      loading: state.loading,
      error: state.error,
      // Actions
      login,
      logout,
      register,
      setUser,
    }),
    [state.user, state.isAuthenticated, state.loading, state.error, login, logout, register, setUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
