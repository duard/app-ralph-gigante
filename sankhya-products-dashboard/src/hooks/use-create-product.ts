import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { productService, type ProductPayload } from '@/lib/api/product-service';
import type { Product } from '@/stores/products-store';

/**
 * Custom hook for creating products
 */
export function useCreateProduct() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdProduct, setCreatedProduct] = useState<Product | null>(null);

    /**
     * Create a new product
     */
    const createProduct = useCallback(async (data: ProductPayload) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await productService.createProduct(data);

            if (response.success && response.data) {
                setCreatedProduct(response.data);
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
            setIsLoading(false);
        }
    }, []);

    /**
     * Reset the hook state
     */
    const reset = useCallback(() => {
        setCreatedProduct(null);
        setError(null);
    }, []);

    return {
        isLoading,
        error,
        createdProduct,
        createProduct,
        reset,
    };
}

export default useCreateProduct;