import { useCallback, useState } from 'react';
import { useDebounce } from '@/lib/utils/debounce';
import { productService } from '@/lib/api/product-service';
import type { Product } from '@/stores/products-store';

/**
 * Custom hook for searching products with optimized debouncing
 */
export function useSearchProducts(debounceMs: number = 300) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Product[]>([]);
  const [query, setQuery] = useState('');

  /**
   * Perform the actual API search
   */
  const performSearch = useCallback(async (searchQuery: string) => {
    // If query is empty, clear results immediately
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await productService.searchProducts(searchQuery);

      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setResults([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar produtos';
      setError(errorMessage);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Debounced search with improved performance
   */
  const {
    debounced: debouncedSearch,
    cancel,
    pending,
  } = useDebounce(
    (searchQuery: string) => {
      performSearch(searchQuery);
    },
    debounceMs,
    {
      leading: false, // Don't execute immediately
      trailing: true, // Execute after delay
      maxWait: debounceMs * 3, // Maximum wait time to prevent hanging
    }
  );

  /**
   * Perform search with debouncing
   */
  const search = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);

      // Set loading state immediately for UI responsiveness
      if (searchQuery.trim()) {
        setIsLoading(true);
      }
      setError(null);

      // Trigger debounced search
      debouncedSearch(searchQuery);
    },
    [debouncedSearch]
  );

  /**
   * Clear search results
   */
  const clearSearch = useCallback(() => {
    // Cancel any pending debounced calls
    cancel();

    setQuery('');
    setResults([]);
    setError(null);
    setIsLoading(false);
  }, [cancel]);

  /**
   * Cancel pending search operations
   */
  const cancelSearch = useCallback(() => {
    cancel();
    setIsLoading(false);
  }, [cancel]);

  /**
   * Check if there's a pending search
   */
  const isPendingSearch = useCallback(() => {
    return pending();
  }, [pending]);

  return {
    query,
    results,
    isLoading,
    error,
    search,
    clearSearch,
    cancelSearch,
    isPendingSearch,
  };
}

export default useSearchProducts;
