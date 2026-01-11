// Query Provider
export { QueryProvider, queryClient } from './query-provider'

// Product Queries
export {
  productKeys,
  useProductsQuery,
  useProductQuery,
  useProductSearchQuery,
  useProductCategoriesQuery,
  useProductStatsQuery,
  useProductsByCategoryQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useDeleteProductsMutation,
  useToggleProductStatusMutation,
  useUpdateStockMutation,
  usePrefetchProduct,
  useInvalidateProducts,
} from './product-queries'

// Auth Queries
export {
  authKeys,
  useAuthCheckQuery,
  useCurrentUserQuery,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useChangePasswordMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  usePrefetchCurrentUser,
  useInvalidateAuth,
} from './auth-queries'