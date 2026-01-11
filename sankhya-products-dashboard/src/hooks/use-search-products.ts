import { useCallback, useEffect, useRef, useState } from 'react';
import { productService } from '@/lib/api/product-service';
import type { Product } from '@/stores/products-store';

/**
 * Custom hook for searching products with debouncing
 */
export function useSearchProducts(debounceMs: number = 300) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<Product[]>([]);
    const [query, setQuery] = useState('');
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Perform search with debouncing
     */
    const search = useCallback(
        (searchQuery: string) => {
            setQuery(searchQuery);

            // Clear previous timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            // If query is empty, clear results immediately
            if (!searchQuery.trim()) {
                setResults([]);
                setError(null);
                return;
            }

            // Set loading state
            setIsLoading(true);
            setError(null);

            // Debounce the actual search
            debounceTimeoutRef.current = setTimeout(async () => {
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
            }, debounceMs);
        },
        [debounceMs]
    );

    /**
     * Clear search results
     */
    const clearSearch = useCallback(() => {
        setQuery('');
        setResults([]);
        setError(null);
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
    }, []);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    return {
        query,
        results,
        isLoading,
        error,
        search,
        clearSearch,
    };
}

export default useSearchProducts;