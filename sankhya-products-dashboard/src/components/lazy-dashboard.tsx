import * as React from "react"

// Lazy load dashboard components
export const LazyPriceTrendChart = React.lazy(() =>
  import("@/components/dashboard/price-trend-chart").then(module => ({
    default: module.PriceTrendChart
  }))
)

export const LazyTopSellingProducts = React.lazy(() =>
  import("@/components/dashboard/top-selling-products").then(module => ({
    default: module.TopSellingProducts
  }))
)

export const LazyRecentProducts = React.lazy(() =>
  import("@/components/dashboard/recent-products").then(module => ({
    default: module.RecentProducts
  }))
)

export const LazyCategoryDistributionChart = React.lazy(() =>
  import("@/app/dashboard/components/category-distribution-chart").then(module => ({
    default: module.CategoryDistributionChart
  }))
)

// Loading component
export function LazyLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}