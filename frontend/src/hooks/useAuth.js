import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to access authentication context.
 * 
 * @returns {{
 *   user: Object|null,
 *   currentUser: Object|null,
 *   setUser: Function,
 *   loading: boolean,
 *   error: string|null,
 *   login: Function,
 *   register: Function,
 *   logout: Function,
 *   isAuthenticated: boolean
 * }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
