import { useMemo } from 'react'
import { useProductsStore } from '@/stores/products-store'

export function useDashboardMetrics() {
  const products = useProductsStore((state) => state.products)

  const metrics = useMemo(() => {
    const totalProducts = products.length
    const activeProducts = products.filter((p) => p.ativo === 'S').length
    const inactiveProducts = products.filter((p) => p.ativo === 'N').length
    const outOfStockProducts = products.filter((p) => (p.estoque ?? 0) <= 0).length
    const totalStockValue = products.reduce(
      (total, p) => total + (p.estoque ?? 0) * (p.vlrvenda ?? 0),
      0
    )
    const totalCostValue = products.reduce(
      (total, p) => total + (p.estoque ?? 0) * (p.vlrcusto ?? 0),
      0
    )
    const totalUnitsInStock = products.reduce((total, p) => total + (p.estoque ?? 0), 0)
    const averagePrice =
      totalProducts > 0
        ? products.reduce((total, p) => total + (p.vlrvenda ?? 0), 0) / totalProducts
        : 0
    const averageCost =
      totalProducts > 0
        ? products.reduce((total, p) => total + (p.vlrcusto ?? 0), 0) / totalProducts
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
    }
  }, [products])

  return metrics
}
