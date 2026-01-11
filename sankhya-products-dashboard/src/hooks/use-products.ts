import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useProductsStore, type Product, type ProductFilters } from '@/stores/products-store';
import { productService, type ProductPayload, type ProductSearchParams } from '@/lib/api/product-service';

/**
 * Custom hook for managing products
 */
export function useProducts() {
    const {
        products,
        selectedProduct,
        selectedProducts,
        filters,
        pagination,
        isLoading,
        error,
        setProducts,
        addProduct,
        updateProduct: storeUpdateProduct,
        removeProduct,
        setSelectedProduct,
        toggleProductSelection,
        selectAllProducts,
        clearSelection,
        setFilters,
        resetFilters,
        setPagination,
        setLoading,
        setError,
        getFilteredProducts,
        getActiveProductsCount,
        getInactiveProductsCount,
        getTotalStockValue,
    } = useProductsStore();

    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [cache] = useState(new Map<string, any>());

    /**
     * Fetch all products from API
     */
    const fetchProducts = useCallback(
        async (params?: ProductSearchParams) => {
            try {
                setLoading(true);
                setError(null);

                // Create cache key from params
                const cacheKey = JSON.stringify(params || {});

                // Check cache first
                if (cache.has(cacheKey)) {
                    const cachedResponse = cache.get(cacheKey);
                    setProducts(cachedResponse.data);

                    if (cachedResponse.meta) {
                        setPagination({
                            page: cachedResponse.meta.page,
                            pageSize: cachedResponse.meta.pageSize,
                            total: cachedResponse.meta.total,
                            totalPages: cachedResponse.meta.totalPages,
                        });
                    }

                    return cachedResponse;
                }

                const response = await productService.getProducts(params);

                if (response.success && response.data) {
                    // Cache the response
                    cache.set(cacheKey, response);

                    setProducts(response.data);

                    if (response.meta) {
                        setPagination({
                            page: response.meta.page,
                            pageSize: response.meta.pageSize,
                            total: response.meta.total,
                            totalPages: response.meta.totalPages,
                        });
                    }
                }

                return response;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produtos';
                setError(errorMessage);
                toast.error(errorMessage);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [setProducts, setPagination, setLoading, setError, cache]
    );

    /**
     * Fetch a single product by ID
     */
    const fetchProduct = useCallback(
        async (id: number) => {
            try {
                setLoading(true);

                const response = await productService.getProductById(id);

                if (response.success && response.data) {
                    setSelectedProduct(response.data);
                    return response.data;
                }

                return null;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produto';
                setError(errorMessage);
                toast.error(errorMessage);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [setSelectedProduct, setLoading, setError]
    );

    /**
     * Create a new product
     */
    const createProduct = useCallback(
        async (data: ProductPayload) => {
            try {
                setLoading(true);

                const response = await productService.createProduct(data);

                if (response.success && response.data) {
                    addProduct(response.data);
                    toast.success('Produto criado com sucesso');
                    return response.data;
                }

                return null;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro ao criar produto';
                setError(errorMessage);
                toast.error(errorMessage);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [addProduct, setLoading, setError]
    );

    /**
     * Update an existing product
     */
    const updateProduct = useCallback(
        async (id: number, data: Partial<ProductPayload>) => {
            try {
                setLoading(true);

                const response = await productService.updateProduct(id, data);

                if (response.success && response.data) {
                    storeUpdateProduct(id, response.data);
                    toast.success('Produto atualizado com sucesso');
                    return response.data;
                }

                return null;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar produto';
                setError(errorMessage);
                toast.error(errorMessage);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [storeUpdateProduct, setLoading, setError]
    );

    /**
     * Delete a product
     */
    const deleteProduct = useCallback(
        async (id: number) => {
            try {
                setLoading(true);

                const response = await productService.deleteProduct(id);

                if (response.success) {
                    removeProduct(id);
                    toast.success('Produto excluído com sucesso');
                    return true;
                }

                return false;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir produto';
                setError(errorMessage);
                toast.error(errorMessage);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [removeProduct, setLoading, setError]
    );

    /**
     * Delete multiple products
     */
    const deleteProducts = useCallback(
        async (ids: number[]) => {
            try {
                setLoading(true);

                const response = await productService.deleteProducts(ids);

                if (response.success) {
                    ids.forEach((id) => removeProduct(id));
                    clearSelection();
                    toast.success(`${ids.length} produto(s) excluído(s) com sucesso`);
                    return true;
                }

                return false;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir produtos';
                setError(errorMessage);
                toast.error(errorMessage);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [removeProduct, clearSelection, setLoading, setError]
    );

    /**
     * Search products
     */
    const searchProducts = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                setSearchResults([]);
                return [];
            }

            try {
                const response = await productService.searchProducts(query);

                if (response.success && response.data) {
                    setSearchResults(response.data);
                    return response.data;
                }

                return [];
            } catch (err) {
                console.error('Search error:', err);
                return [];
            }
        },
        []
    );

    /**
     * Refresh products list
     */
    const refresh = useCallback(() => {
        return fetchProducts({
            pagination: { page: pagination.page, pageSize: pagination.pageSize },
            filters,
        });
    }, [fetchProducts, pagination.page, pagination.pageSize, filters]);

    /**
     * Apply filters and refetch
     */
    const applyFilters = useCallback(
        (newFilters: Partial<ProductFilters>) => {
            setFilters(newFilters);
        },
        [setFilters]
    );

    /**
     * Change page
     */
    const goToPage = useCallback(
        (page: number) => {
            setPagination({ page });
        },
        [setPagination]
    );

    /**
     * Change page size
     */
    const changePageSize = useCallback(
        (pageSize: number) => {
            setPagination({ pageSize, page: 1 });
        },
        [setPagination]
    );

    // Refetch when filters or pagination change
    useEffect(() => {
        const fetchData = async () => {
            await fetchProducts({
                pagination: { page: pagination.page, pageSize: pagination.pageSize },
                filters,
            });
        };

        // Only fetch if we don't have products yet or filters changed
        if (products.length === 0) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        // State
        products,
        filteredProducts: getFilteredProducts(),
        selectedProduct,
        selectedProducts,
        filters,
        pagination,
        isLoading,
        error,
        searchResults,

        // Computed
        activeCount: getActiveProductsCount(),
        inactiveCount: getInactiveProductsCount(),
        totalStockValue: getTotalStockValue(),

        // Actions
        fetchProducts,
        fetchProduct,
        createProduct,
        updateProduct,
        deleteProduct,
        deleteProducts,
        searchProducts,
        refresh,

        // Filters & Pagination
        setFilters: applyFilters,
        resetFilters,
        goToPage,
        changePageSize,

        // Selection
        setSelectedProduct,
        toggleProductSelection,
        selectAllProducts,
        clearSelection,
    };
}

export default useProducts;
