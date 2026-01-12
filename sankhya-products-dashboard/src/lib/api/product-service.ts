import { get, post, put, del } from './client';
import type { Product, ProductFilters } from '@/stores/products-store';
import type { ApiResponse, PaginatedResponse, SortParams } from '@/types/api';

/**
 * Product create/update payload
 */
export interface ProductPayload {
    descrprod: string;
    reffab?: string;
    codvol?: string;
    vlrvenda?: number;
    vlrcusto?: number;
    estoque?: number;
    estmin?: number;
    ativo?: 'S' | 'N';
    codgrupoprod?: number;
    descrgrupoprod?: string;
    codmarca?: number;
    ncm?: string;
    cest?: string;
    pesoliq?: number;
    pesobruto?: number;
    observacao?: string;
    imagem?: string;
}

/**
 * Product search params
 */
export interface ProductSearchParams {
    query?: string;
    filters?: ProductFilters;
    sort?: SortParams[];
    pagination?: {
        page?: number;
        pageSize?: number;
    };
}

/**
 * Product service for CRUD operations
 */
export const productService = {
    /**
     * Get all products with optional filters and pagination
     */
    async getProducts(params?: ProductSearchParams): Promise<PaginatedResponse<Product>> {
        const queryParams = new URLSearchParams();

        if (params?.pagination) {
            if (params.pagination.page) queryParams.set('page', params.pagination.page.toString());
            if (params.pagination.pageSize) queryParams.set('pageSize', params.pagination.pageSize.toString());
        }

        if (params?.query) {
            queryParams.set('search', params.query);
        }

        if (params?.filters) {
            if (params.filters.status && params.filters.status !== 'all') {
                queryParams.set('ativo', params.filters.status === 'active' ? 'S' : 'N');
            }
            if (params.filters.category) {
                queryParams.set('codgrupoprod', params.filters.category);
            }
            if (params.filters.priceMin !== undefined) {
                queryParams.set('priceMin', params.filters.priceMin.toString());
            }
            if (params.filters.priceMax !== undefined) {
                queryParams.set('priceMax', params.filters.priceMax.toString());
            }
        }

        if (params?.sort && params.sort.length > 0) {
            queryParams.set('sortBy', params.sort[0].field);
            queryParams.set('sortOrder', params.sort[0].order);
        }

        const queryString = queryParams.toString();
        const url = `/tgfpro${queryString ? `?${queryString}` : ''}`;

        return get<PaginatedResponse<Product>>(url);
    },

    /**
     * Get a single product by ID
     */
    async getProductById(id: number): Promise<ApiResponse<Product>> {
        return get<ApiResponse<Product>>(`/tgfpro/${id}`);
    },

    /**
     * Create a new product
     */
    async createProduct(data: ProductPayload): Promise<ApiResponse<Product>> {
        return post<ApiResponse<Product>>('/tgfpro', data);
    },

    /**
     * Update an existing product
     */
    async updateProduct(id: number, data: Partial<ProductPayload>): Promise<ApiResponse<Product>> {
        return put<ApiResponse<Product>>(`/tgfpro/${id}`, data);
    },

    /**
     * Delete a product
     */
    async deleteProduct(id: number): Promise<ApiResponse<void>> {
        return del<ApiResponse<void>>(`/tgfpro/${id}`);
    },

    /**
     * Delete multiple products
     */
    async deleteProducts(ids: number[]): Promise<ApiResponse<void>> {
        return post<ApiResponse<void>>('/tgfpro/bulk-delete', { ids });
    },

    /**
     * Search products by term
     */
    async searchProducts(query: string): Promise<PaginatedResponse<Product>> {
        return get<PaginatedResponse<Product>>(`/tgfpro/search?q=${encodeURIComponent(query)}`);
    },

    /**
     * Get products by category
     */
    async getProductsByCategory(categoryId: number): Promise<PaginatedResponse<Product>> {
        return get<PaginatedResponse<Product>>(`/tgfpro?codgrupoprod=${categoryId}`);
    },

    /**
     * Toggle product status (active/inactive)
     */
    async toggleProductStatus(id: number): Promise<ApiResponse<Product>> {
        return post<ApiResponse<Product>>(`/tgfpro/${id}/toggle-status`);
    },

    /**
     * Update stock for a product
     */
    async updateStock(id: number, quantity: number): Promise<ApiResponse<Product>> {
        return post<ApiResponse<Product>>(`/tgfpro/${id}/update-stock`, { quantity });
    },

    /**
     * Get product categories
     */
    async getCategories(): Promise<ApiResponse<{ id: number; name: string }[]>> {
        return get<ApiResponse<{ id: number; name: string }[]>>('/tgfgru');
    },

    /**
     * Get product count by status
     */
    async getProductStats(): Promise<
        ApiResponse<{
            total: number;
            active: number;
            inactive: number;
            lowStock: number;
            totalValue: number;
        }>
    > {
        return get<ApiResponse<{
            total: number;
            active: number;
            inactive: number;
            lowStock: number;
            totalValue: number;
        }>>('/tgfpro/stats');
    },

    /**
     * Export products to CSV
     */
    async exportToCSV(filters?: ProductFilters): Promise<Blob> {
        const queryParams = new URLSearchParams();

        if (filters) {
            if (filters.status && filters.status !== 'all') {
                queryParams.set('ativo', filters.status === 'active' ? 'S' : 'N');
            }
            if (filters.category) {
                queryParams.set('codgrupoprod', filters.category);
            }
        }

        const queryString = queryParams.toString();
        const url = `/tgfpro/export/csv${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url);
        return response.blob();
    },
};

export default productService;
