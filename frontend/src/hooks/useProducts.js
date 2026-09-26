import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../services/productService';

/**
 * Custom hook to fetch and manage products state with loading, error, and refetch support.
 * 
 * @param {Object} [params] 
 * @returns {{
 *   products: Array,
 *   loading: boolean,
 *   error: string|null,
 *   refetch: Function
 * }}
 */
export const useProducts = (params) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const response = await getProducts(params);
        if (!isMounted) return;

        if (response && Array.isArray(response.data)) {
          setProducts(response.data);
        } else if (Array.isArray(response)) {
          setProducts(response);
        } else {
          setProducts([]);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.userMessage || 'Failed to fetch products from API.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [params, reloadKey]);

  return {
    products,
    loading,
    error,
    refetch,
  };
};

export default useProducts;
