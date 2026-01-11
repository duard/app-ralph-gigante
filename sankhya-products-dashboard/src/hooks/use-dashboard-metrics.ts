import { useMemo } from 'react'
import { useProductsStore } from '@/stores/products-store'

export type PeriodFilter = 'all' | 'today' | 'week' | 'month'

export function useDashboardMetrics(period: PeriodFilter = 'all') {
  const products = useProductsStore((state) => state.products)

  const metrics = useMemo(() => {
    // Filter products by period based on registration date (dtcad) or alteration date (dtalter)
    const now = new Date()
    let filteredProducts = products

    if (period !== 'all') {
      filteredProducts = products.filter((product) => {
        // Try to use dtalter first, fallback to dtcad
        const dateString = product.dtalter || product.dtcad
        if (!dateString) return false

        const productDate = new Date(dateString)
        
        switch (period) {
          case 'today':
            return productDate.toDateString() === now.toDateString()
          case 'week': {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return productDate >= weekAgo
          }
          case 'month': {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return productDate >= monthAgo
          }
          default:
            return true
        }
      })
    }

    const totalProducts = filteredProducts.length
    const activeProducts = filteredProducts.filter((p) => p.ativo === 'S').length
    const inactiveProducts = filteredProducts.filter((p) => p.ativo === 'N').length
    const outOfStockProducts = filteredProducts.filter((p) => (p.estoque ?? 0) <= 0).length
    const totalStockValue = filteredProducts.reduce(
      (total, p) => total + (p.estoque ?? 0) * (p.vlrvenda ?? 0),
      0
    )
    const totalCostValue = filteredProducts.reduce(
      (total, p) => total + (p.estoque ?? 0) * (p.vlrcusto ?? 0),
      0
    )
    const totalUnitsInStock = filteredProducts.reduce((total, p) => total + (p.estoque ?? 0), 0)
    const averagePrice =
      totalProducts > 0
        ? filteredProducts.reduce((total, p) => total + (p.vlrvenda ?? 0), 0) / totalProducts
        : 0
    const averageCost =
      totalProducts > 0
        ? filteredProducts.reduce((total, p) => total + (p.vlrcusto ?? 0), 0) / totalProducts
        : 0

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      outOfStockProducts,
      totalStockValue,
      totalCostValue,
      totalUnitsInStock,
      averagePrice,
      averageCost,
      period,
    }
  }, [products, period])

  return metrics
}

// Keep the original function for backward compatibility
export function useDashboardMetricsLegacy() {
  return useDashboardMetrics('all')
}
