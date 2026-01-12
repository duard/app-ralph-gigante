import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useProductsStore, type Product, type ProductFilters } from '@/stores/products-store';
import {
  useProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useDeleteProductsMutation,
  useToggleProductStatusMutation,
  useUpdateStockMutation,
  useInvalidateProducts,
} from '@/lib/react-query';
import type { ProductSearchParams } from '@/lib/api/product-service';
import type { ProductPayload } from '@/lib/api/product-service';
import { productService } from '@/lib/api/product-service';

/**
 * Enhanced custom hook for managing products with React Query caching
 */
export function useProductsWithCache(params?: ProductSearchParams) {
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

  // React Query hooks - merge passed params with correct structure
  const queryParams: ProductSearchParams = {
    ...params,
    pagination: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
    },
  };

  console.log('[useProductsWithCache] Query params:', queryParams);
  const productsQuery = useProductsQuery(queryParams);
  const createProductMutation = useCreateProductMutation();
  const updateProductMutation = useUpdateProductMutation();
  const deleteProductMutation = useDeleteProductMutation();
  const deleteProductsMutation = useDeleteProductsMutation();
  const toggleStatusMutation = useToggleProductStatusMutation();
  const updateStockMutation = useUpdateStockMutation();
  const invalidateProducts = useInvalidateProducts();

  // Sync React Query data with Zustand store
  useEffect(() => {
    if (productsQuery.data && productsQuery.data.data) {
      setProducts(productsQuery.data.data);

      setPagination({
        page: productsQuery.data.page,
        pageSize: productsQuery.data.perPage,
        total: productsQuery.data.total,
        totalPages: productsQuery.data.lastPage,
      });
    }
  }, [productsQuery.data, setProducts, setPagination]);

  // Update loading state
  useEffect(() => {
    setLoading(productsQuery.isLoading || productsQuery.isFetching);
  }, [productsQuery.isLoading, productsQuery.isFetching, setLoading]);

  // Update error state
  useEffect(() => {
    if (productsQuery.error) {
      const errorMessage =
        productsQuery.error instanceof Error
          ? productsQuery.error.message
          : 'Erro ao carregar produtos';
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [productsQuery.error, setError]);

  /**
   * Fetch a single product by ID
   */
  const fetchProduct = useCallback(
    async (id: number) => {
      try {
        setSelectedProduct(null);
        setLoading(true);

        // This will use React Query caching automatically
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

        const response = await createProductMutation.mutateAsync(data);

        if (response.success && response.data) {
          // Replace optimistic product with real data
          storeUpdateProduct(optimisticProduct.codprod, response.data);
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
    [addProduct, storeUpdateProduct, removeProduct, setLoading, setError, createProductMutation]
  );

  /**
   * Update an existing product with optimistic update
   */
  const updateProduct = useCallback(
    async (id: number, data: Partial<ProductPayload>) => {
      // Get current product for rollback
      const currentProduct = products.find((p) => p.codprod === id);
      if (!currentProduct) return null;

      // Apply optimistic update
      storeUpdateProduct(id, data);

      try {
        setLoading(true);

        const response = await updateProductMutation.mutateAsync({ id, data });

        if (response.success && response.data) {
          // Update with server response (in case server modifies data)
          storeUpdateProduct(id, response.data);
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
    [products, storeUpdateProduct, setLoading, setError, updateProductMutation]
  );

  /**
   * Delete a product with optimistic update
   */
  const deleteProduct = useCallback(
    async (id: number) => {
      // Get product for rollback
      const productToDelete = products.find((p) => p.codprod === id);
      if (!productToDelete) return false;

      // Apply optimistic delete
      removeProduct(id);

      try {
        setLoading(true);

        const success = await deleteProductMutation.mutateAsync(id);
        return success;
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
    [products, removeProduct, addProduct, setLoading, setError, deleteProductMutation]
  );

  /**
   * Delete multiple products with optimistic update
   */
  const deleteProducts = useCallback(
    async (ids: number[]) => {
      // Get products for rollback
      const productsToDelete = products.filter((p) => ids.includes(p.codprod));

      // Apply optimistic delete
      ids.forEach((id) => removeProduct(id));
      clearSelection();

      try {
        setLoading(true);

        const success = await deleteProductsMutation.mutateAsync(ids);
        return success;
      } catch (err) {
        // Revert optimistic delete
        productsToDelete.forEach((product) => addProduct(product));

        const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir produtos';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      products,
      removeProduct,
      addProduct,
      clearSelection,
      setLoading,
      setError,
      deleteProductsMutation,
    ]
  );

  /**
   * Toggle product status
   */
  const toggleProductStatus = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const response = await toggleStatusMutation.mutateAsync(id);

        if (response.success && response.data) {
          // Update product in store
          storeUpdateProduct(id, { ativo: response.data.ativo });
        }

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar status';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [storeUpdateProduct, setLoading, setError, toggleStatusMutation]
  );

  /**
   * Update product stock
   */
  const updateProductStock = useCallback(
    async (id: number, quantity: number) => {
      try {
        setLoading(true);
        const response = await updateStockMutation.mutateAsync({ id, quantity });

        if (response.success && response.data) {
          // Update product in store
          storeUpdateProduct(id, { estoque: response.data.estoque });
        }

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar estoque';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [storeUpdateProduct, setLoading, setError, updateStockMutation]
  );

  /**
   * Search products (uses React Query caching)
   */
  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      return [];
    }

    try {
      // This will use React Query caching automatically
      const response = await productService.searchProducts(query);

      if (response.success && response.data) {
        return response.data;
      }

      return [];
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  }, []);

  /**
   * Refresh products list
   */
  const refresh = useCallback(() => {
    productsQuery.refetch();
  }, [productsQuery]);

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

  // Retry function for failed requests
  const retry = useCallback(() => {
    productsQuery.refetch();
  }, [productsQuery]);

  return {
    // State
    products,
    filteredProducts: getFilteredProducts(),
    selectedProduct,
    selectedProducts,
    filters,
    pagination,
    isLoading: isLoading || productsQuery.isLoading,
    error: error || productsQuery.error,
    isRefetching: productsQuery.isFetching,
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending || deleteProductsMutation.isPending,

    // Computed
    activeCount: getActiveProductsCount(),
    inactiveCount: getInactiveProductsCount(),
    totalStockValue: getTotalStockValue(),

    // Actions
    fetchProducts: refresh,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteProducts,
    toggleProductStatus,
    updateProductStock,
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

    // React Query specific
    invalidateCache: invalidateProducts,
  };
}

export default useProductsWithCache;
