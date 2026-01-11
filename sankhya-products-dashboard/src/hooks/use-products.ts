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
     * Create a new product with optimistic update
     */
    const createProduct = useCallback(
        async (data: ProductPayload) => {
            // Create optimistic product
            const optimisticProduct: Product = {
                id: Date.now(), // Temporary ID
                codprod: Date.now(), // Temporary code
                descrprod: data.descrprod || '',
                reffab: data.reffab,
                codvol: data.codvol,
                vlrvenda: data.vlrvenda,
                vlrcusto: data.vlrcusto,
                estoque: data.estoque,
                estmin: data.estmin,
                ativo: data.ativo || 'S',
                codgrupoprod: data.codgrupoprod,
                descrgrupoprod: data.descrgrupoprod,
                codmarca: data.codmarca,
                ncm: data.ncm,
                cest: data.cest,
                pesoliq: data.pesoliq,
                pesobruto: data.pesobruto,
                observacao: data.observacao,
                imagem: data.imagem,
                dtcad: new Date().toISOString(),
                dtalter: new Date().toISOString(),
            };

            // Add optimistic product immediately
            addProduct(optimisticProduct);

            try {
                setLoading(true);

                const response = await productService.createProduct(data);

                if (response.success && response.data) {
                    // Replace optimistic product with real data
                    storeUpdateProduct(optimisticProduct.codprod, response.data);
                    toast.success('Produto criado com sucesso');
                    return response.data;
                }

                // Remove optimistic product if failed
                removeProduct(optimisticProduct.codprod);
                return null;
            } catch (err) {
                // Remove optimistic product on error
                removeProduct(optimisticProduct.codprod);

                const errorMessage = err instanceof Error ? err.message : 'Erro ao criar produto';
                setError(errorMessage);
                toast.error(errorMessage);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [addProduct, storeUpdateProduct, removeProduct, setLoading, setError]
    );

    /**
     * Update an existing product with optimistic update
     */
    const updateProduct = useCallback(
        async (id: number, data: Partial<ProductPayload>) => {
            // Get current product for rollback
            const currentProduct = products.find(p => p.codprod === id);
            if (!currentProduct) return null;

            // Apply optimistic update
            storeUpdateProduct(id, data);

            try {
                setLoading(true);

                const response = await productService.updateProduct(id, data);

                if (response.success && response.data) {
                    // Update with server response (in case server modifies data)
                    storeUpdateProduct(id, response.data);
                    toast.success('Produto atualizado com sucesso');
                    return response.data;
                }

                // Revert optimistic update
                storeUpdateProduct(id, currentProduct);
                return null;
            } catch (err) {
                // Revert optimistic update
                storeUpdateProduct(id, currentProduct);

                const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar produto';
                setError(errorMessage);
                toast.error(errorMessage);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [products, storeUpdateProduct, setLoading, setError]
    );

    /**
     * Delete a product with optimistic update
     */
    const deleteProduct = useCallback(
        async (id: number) => {
            // Get product for rollback
            const productToDelete = products.find(p => p.codprod === id);
            if (!productToDelete) return false;

            // Apply optimistic delete
            removeProduct(id);

            try {
                setLoading(true);

                const response = await productService.deleteProduct(id);

                if (response.success) {
                    toast.success('Produto excluído com sucesso');
                    return true;
                }

                // Revert optimistic delete
                addProduct(productToDelete);
                return false;
            } catch (err) {
                // Revert optimistic delete
                addProduct(productToDelete);

                const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir produto';
                setError(errorMessage);
                toast.error(errorMessage);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [products, removeProduct, addProduct, setLoading, setError]
    );

    /**
     * Delete multiple products with optimistic update
     */
    const deleteProducts = useCallback(
        async (ids: number[]) => {
            // Get products for rollback
            const productsToDelete = products.filter(p => ids.includes(p.codprod));

            // Apply optimistic delete
            ids.forEach((id) => removeProduct(id));
            clearSelection();

            try {
                setLoading(true);

                const response = await productService.deleteProducts(ids);

                if (response.success) {
                    toast.success(`${ids.length} produto(s) excluído(s) com sucesso`);
                    return true;
                }

                // Revert optimistic delete
                productsToDelete.forEach(product => addProduct(product));
                return false;
            } catch (err) {
                // Revert optimistic delete
                productsToDelete.forEach(product => addProduct(product));

                const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir produtos';
                setError(errorMessage);
                toast.error(errorMessage);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [products, removeProduct, addProduct, clearSelection, setLoading, setError]
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

    const [retryCount, setRetryCount] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);

    /**
     * Retry last failed request with exponential backoff
     */
    const retry = useCallback(async () => {
        if (!error || isRetrying) return;

        setIsRetrying(true);
        setRetryCount(prev => prev + 1);

        // Exponential backoff: 1s, 2s, 4s, 8s, 16s max
        const delay = Math.min(1000 * Math.pow(2, retryCount), 16000);
        
        await new Promise(resolve => setTimeout(resolve, delay));

        try {
            await refresh();
            setRetryCount(0);
            toast.success('Dados carregados com sucesso após tentativa');
            } catch (_err) {
                if (retryCount >= 3) {
                    toast.error('Número máximo de tentativas alcançado. Verifique sua conexão.');
                }
            } finally {
            setIsRetrying(false);
        }
    }, [error, isRetrying, retryCount, refresh]);

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
        isRetrying,
        retryCount,

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
        retry,

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
