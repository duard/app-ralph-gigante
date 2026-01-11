import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { productService, type ProductPayload } from '@/lib/api/product-service';
import type { Product } from '@/stores/products-store';

/**
 * Custom hook for managing a single product
 */
export function useProduct() {
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch a single product by ID
     */
    const fetchProduct = useCallback(async (id: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await productService.getProductById(id);

            if (response.success && response.data) {
                setProduct(response.data);
                return response.data;
            }

            return null;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produto';
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Update the current product
     */
    const updateProduct = useCallback(async (id: number, data: Partial<ProductPayload>) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await productService.updateProduct(id, data);

            if (response.success && response.data) {
                setProduct(response.data);
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
            setIsLoading(false);
        }
    }, []);

    /**
     * Delete the current product
     */
    const deleteProduct = useCallback(async (id: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await productService.deleteProduct(id);

            if (response.success) {
                setProduct(null);
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
            setIsLoading(false);
        }
    }, []);

    /**
     * Toggle product status
     */
    const toggleStatus = useCallback(async (id: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await productService.toggleProductStatus(id);

            if (response.success && response.data) {
                setProduct(response.data);
                toast.success('Status do produto alterado com sucesso');
                return response.data;
            }

            return null;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar status do produto';
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Update product stock
     */
    const updateStock = useCallback(async (id: number, quantity: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await productService.updateStock(id, quantity);

            if (response.success && response.data) {
                setProduct(response.data);
                toast.success('Estoque atualizado com sucesso');
                return response.data;
            }

            return null;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar estoque';
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Clear current product
     */
    const clearProduct = useCallback(() => {
        setProduct(null);
        setError(null);
    }, []);

    return {
        product,
        isLoading,
        error,
        fetchProduct,
        updateProduct,
        deleteProduct,
        toggleStatus,
        updateStock,
        clearProduct,
        setProduct,
    };
}

export default useProduct;