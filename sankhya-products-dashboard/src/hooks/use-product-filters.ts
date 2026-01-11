import { useCallback } from 'react';
import { useProductsStore, type ProductFilters } from '@/stores/products-store';

/**
 * Custom hook for managing product filters
 */
export function useProductFilters() {
    const {
        filters,
        setFilters,
        resetFilters,
    } = useProductsStore();

    /**
     * Update a specific filter
     */
    const updateFilter = useCallback(
        <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => {
            setFilters({ [key]: value });
        },
        [setFilters]
    );

    /**
     * Update multiple filters at once
     */
    const updateFilters = useCallback(
        (newFilters: Partial<ProductFilters>) => {
            setFilters(newFilters);
        },
        [setFilters]
    );

    /**
     * Clear all filters
     */
    const clearFilters = useCallback(() => {
        resetFilters();
    }, [resetFilters]);

    /**
     * Check if any filters are active
     */
    const hasActiveFilters = useCallback(() => {
        return Object.entries(filters).some(([key, value]) => {
            if (key === 'sortBy' || key === 'sortOrder') return false;
            if (typeof value === 'string') return value.trim() !== '';
            return value !== undefined && value !== null;
        });
    }, [filters]);

    return {
        filters,
        updateFilter,
        updateFilters,
        clearFilters,
        resetFilters,
        hasActiveFilters: hasActiveFilters(),
    };
}

export default useProductFilters;