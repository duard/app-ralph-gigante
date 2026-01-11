import create from 'zustand'
import { persist } from 'zustand/middleware'

 type Product = {
   id: string
   [key: string]: any
 }

 type Filters = {
   query?: string
   category?: string
   status?: string
 }

 type Pagination = {
   page: number
   pageSize: number
   total?: number
 }

 type ProductState = {
   products: Product[]
   product: Product | null
   filters: Filters
   pagination: Pagination

   setProducts: (products: Product[]) => void
   setProduct: (product: Product | null) => void
   setFilters: (filters: Partial<Filters>) => void
   setPagination: (pagination: Partial<Pagination>) => void

   // Derived helpers
   getFilteredProducts: () => Product[]

   clear: () => void
 }

 const useProductsStore = create<ProductState>(
   persist(
     (set, get) => ({
       products: [],
       product: null,
       filters: {},
       pagination: { page: 1, pageSize: 10 },

       setProducts: (products) => set({ products }),
       setProduct: (product) => set({ product }),
       setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
       setPagination: (pagination) =>
         set({ pagination: { ...get().pagination, ...pagination } }),

       getFilteredProducts: () => {
         const { products, filters } = get()
         let list = products
         if (filters.query) {
           const q = filters.query.toLowerCase()
           list = list.filter((p) => String(p.name ?? '').toLowerCase().includes(q) || String(p.id ?? '').toLowerCase().includes(q))
         }
         if (filters.category) {
           const c = String(filters.category).toLowerCase()
           list = list.filter((p) => String(p.category ?? '').toLowerCase() === c)
         }
         if (filters.status) {
           const s = String(filters.status).toLowerCase()
           list = list.filter((p) => String(p.status ?? '').toLowerCase() === s)
         }
         return list
       },

       clear: () => {
         set({ products: [], product: null, filters: {}, pagination: { page: 1, pageSize: 10 } })
       },
     }),
     {
       name: 'products-store',
       // Only persist minimal state to localStorage
       partialize: (state) => ({ products: state.products, filters: state.filters, pagination: state.pagination }),
     }
   )
 )

 export default useProductsStore
