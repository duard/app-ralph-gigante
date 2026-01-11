import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Product interface based on Sankhya schema
 */
export interface Product {
    id: number;
    codprod: number;
    descrprod: string;
    reffab?: string;
    codvol?: string;
    vlrvenda?: number;
    vlrcusto?: number;
    estoque?: number;
    estmin?: number;
    ativo: 'S' | 'N';
    codgrupoprod?: number;
    descrgrupoprod?: string;
    codmarca?: number;
    ncm?: string;
    cest?: string;
    pesoliq?: number;
    pesobruto?: number;
    observacao?: string;
    imagem?: string;
    dtcad?: string;
    dtalter?: string;
}

/**
 * Product filters
 */
export interface ProductFilters {
    search?: string;
    status?: 'all' | 'active' | 'inactive';
    category?: string;
    priceMin?: number;
    priceMax?: number;
    stockMin?: number;
    stockMax?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination state
 */
export interface Pagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

/**
 * Products state
 */
interface ProductsState {
    // State
    products: Product[];
    selectedProduct: Product | null;
    selectedProducts: number[];
    filters: ProductFilters;
    pagination: Pagination;
    isLoading: boolean;
    error: string | null;

    // Actions
    setProducts: (products: Product[]) => void;
    addProduct: (product: Product) => void;
    updateProduct: (id: number, updates: Partial<Product>) => void;
    removeProduct: (id: number) => void;
    setSelectedProduct: (product: Product | null) => void;
    toggleProductSelection: (id: number) => void;
    selectAllProducts: (ids: number[]) => void;
    clearSelection: () => void;
    setFilters: (filters: Partial<ProductFilters>) => void;
    resetFilters: () => void;
    setPagination: (pagination: Partial<Pagination>) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Computed
    getFilteredProducts: () => Product[];
    getActiveProductsCount: () => number;
    getInactiveProductsCount: () => number;
    getTotalStockValue: () => number;
}

const defaultFilters: ProductFilters = {
    search: '',
    status: 'all',
    category: '',
    sortBy: 'codprod',
    sortOrder: 'asc',
};

const defaultPagination: Pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
};

/**
 * Products store with filter persistence
 */
export const useProductsStore = create<ProductsState>()(
    persist(
        (set, get) => ({
            // Initial state
            products: [],
            selectedProduct: null,
            selectedProducts: [],
            filters: defaultFilters,
            pagination: defaultPagination,
            isLoading: false,
            error: null,

            // Actions
            setProducts: (products) =>
                set({
                    products,
                    pagination: {
                        ...get().pagination,
                        total: products.length,
                        totalPages: Math.ceil(products.length / get().pagination.pageSize),
                    },
                }),

            addProduct: (product) =>
                set((state) => ({
                    products: [...state.products, product],
                })),

            updateProduct: (id, updates) =>
                set((state) => ({
                    products: state.products.map((p) =>
                        p.codprod === id ? { ...p, ...updates } : p
                    ),
                    selectedProduct:
                        state.selectedProduct?.codprod === id
                            ? { ...state.selectedProduct, ...updates }
                            : state.selectedProduct,
                })),

            removeProduct: (id) =>
                set((state) => ({
                    products: state.products.filter((p) => p.codprod !== id),
                    selectedProducts: state.selectedProducts.filter((pid) => pid !== id),
                    selectedProduct:
                        state.selectedProduct?.codprod === id
                            ? null
                            : state.selectedProduct,
                })),

            setSelectedProduct: (product) => set({ selectedProduct: product }),

            toggleProductSelection: (id) =>
                set((state) => ({
                    selectedProducts: state.selectedProducts.includes(id)
                        ? state.selectedProducts.filter((pid) => pid !== id)
                        : [...state.selectedProducts, id],
                })),

            selectAllProducts: (ids) => set({ selectedProducts: ids }),

            clearSelection: () => set({ selectedProducts: [] }),

            setFilters: (filters) =>
                set((state) => ({
                    filters: { ...state.filters, ...filters },
                    pagination: { ...state.pagination, page: 1 },
                })),

            resetFilters: () =>
                set({
                    filters: defaultFilters,
                    pagination: { ...defaultPagination },
                }),

            setPagination: (pagination) =>
                set((state) => ({
                    pagination: { ...state.pagination, ...pagination },
                })),

            setLoading: (isLoading) => set({ isLoading }),

            setError: (error) => set({ error, isLoading: false }),

            // Computed
            getFilteredProducts: () => {
                const { products, filters } = get();
                let filtered = [...products];

                // Filter by search
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    filtered = filtered.filter(
                        (p) =>
                            p.descrprod.toLowerCase().includes(searchLower) ||
                            p.codprod.toString().includes(searchLower) ||
                            p.reffab?.toLowerCase().includes(searchLower)
                    );
                }

                // Filter by status
                if (filters.status && filters.status !== 'all') {
                    filtered = filtered.filter((p) =>
                        filters.status === 'active' ? p.ativo === 'S' : p.ativo === 'N'
                    );
                }

                // Filter by category
                if (filters.category) {
                    filtered = filtered.filter(
                        (p) => p.codgrupoprod?.toString() === filters.category
                    );
                }

                // Filter by price range
                if (filters.priceMin !== undefined) {
                    filtered = filtered.filter(
                        (p) => (p.vlrvenda ?? 0) >= (filters.priceMin ?? 0)
                    );
                }
                if (filters.priceMax !== undefined) {
                    filtered = filtered.filter(
                        (p) => (p.vlrvenda ?? 0) <= (filters.priceMax ?? Infinity)
                    );
                }

                // Sort
                if (filters.sortBy) {
                    filtered.sort((a, b) => {
                        const aVal = a[filters.sortBy as keyof Product];
                        const bVal = b[filters.sortBy as keyof Product];

                        if (aVal === undefined || aVal === null) return 1;
                        if (bVal === undefined || bVal === null) return -1;

                        const comparison =
                            typeof aVal === 'string'
                                ? aVal.localeCompare(bVal as string)
                                : (aVal as number) - (bVal as number);

                        return filters.sortOrder === 'desc' ? -comparison : comparison;
                    });
                }

                return filtered;
            },

            getActiveProductsCount: () =>
                get().products.filter((p) => p.ativo === 'S').length,

            getInactiveProductsCount: () =>
                get().products.filter((p) => p.ativo === 'N').length,

            getTotalStockValue: () =>
                get().products.reduce(
                    (total, p) => total + (p.estoque ?? 0) * (p.vlrvenda ?? 0),
                    0
                ),
        }),
        {
            name: 'products-filters-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                filters: state.filters,
                pagination: { pageSize: state.pagination.pageSize },
            }),
        }
    )
);
