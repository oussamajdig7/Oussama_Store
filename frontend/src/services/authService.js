import api from './api';

const TOKEN_KEY = 'token';

/**
 * Register a new user account.
 * 
 * @param {Object} userData - User registration details { name, email, password }
 * @returns {Promise<Object>} API response { success: true, message: string, data: { user, token } }
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data?.data?.token) {
    setToken(response.data.data.token);
  }
  return response.data;
};

/**
 * Log in an existing user with credentials.
 * 
 * @param {Object} credentials - User credentials { email, password }
 * @returns {Promise<Object>} API response { success: true, message: string, data: { user, token } }
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data?.data?.token) {
    setToken(response.data.data.token);
  }
  return response.data;
};

/**
 * Get the currently authenticated user's profile (/api/auth/me).
 * 
 * @returns {Promise<Object>} API response { success: true, data: User }
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Log out the current user by removing the stored JWT token.
 */
export const logout = () => {
  removeToken();
};

/**
 * Get the stored JWT token from localStorage.
 * 
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store JWT token in localStorage.
 * 
 * @param {string} token
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove JWT token from localStorage.
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const authService = {
  register,
  login,
  getCurrentUser,
  logout,
  getToken,
  setToken,
  removeToken,
};

export default authService;
