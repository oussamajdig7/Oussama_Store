/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import {
  getCurrentUser,
  login as apiLogin,
  register as apiRegister,
  logout as authLogout,
  getToken,
} from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        if (isMounted && response && response.data) {
          setUser(response.data);
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        authLogout();
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const response = await apiLogin(credentials);
    if (response?.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  const register = async (userData) => {
    const response = await apiRegister(userData);
    if (response?.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
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
