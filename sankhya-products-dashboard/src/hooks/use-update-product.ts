import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { productService, type ProductPayload } from '@/lib/api/product-service';
import type { Product } from '@/stores/products-store';

/**
 * Custom hook for updating products
 */
export function useUpdateProduct() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updatedProduct, setUpdatedProduct] = useState<Product | null>(null);

    /**
     * Update an existing product
     */
    const updateProduct = useCallback(async (id: number, data: Partial<ProductPayload>) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await productService.updateProduct(id, data);

            if (response.success && response.data) {
                setUpdatedProduct(response.data);
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
     * Reset the hook state
     */
    const reset = useCallback(() => {
        setUpdatedProduct(null);
        setError(null);
    }, []);

    return {
        isLoading,
        error,
        updatedProduct,
        updateProduct,
        reset,
    };
}

export default useUpdateProduct;