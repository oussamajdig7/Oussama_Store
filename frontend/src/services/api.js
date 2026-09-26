import axios from 'axios';

/**
 * Base URL for the Express REST API.
 * Configured via Vite environment variable VITE_API_URL.
 * Fallback to http://localhost:5000/api if not defined.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Reusable Axios instance with base configuration.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request Interceptor:
 * Automatically attaches JWT Bearer token from localStorage to headers if present.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Centralizes error handling and formatting.
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Standardize error message for components
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    // Attach custom message to error object
    error.userMessage = message;

    // Handle 401 Unauthorized (e.g., token expired)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Potential redirect or auth event dispatch can be handled here if needed
    }

    return Promise.reject(error);
  }
);

export default api;
