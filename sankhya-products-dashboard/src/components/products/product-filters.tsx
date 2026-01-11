"use client"

import * as React from "react"
import { Search, X, Filter } from "lucide-react"
import { useProductsStore } from "@/stores/products-store"
import { useProducts } from "@/hooks/use-products"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function ProductFilters() {
  const { filters, setFilters, resetFilters } = useProductsStore()
  const { products } = useProducts()
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false)
  const searchValue = filters?.search ?? ""
  const statusValue = filters?.status ?? 'all'

  // Get unique categories from products
  const categories = React.useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map(p => p.descrgrupoprod).filter(Boolean))
    ).sort()
    return uniqueCategories
  }, [products])

  // Get price range from products
  const priceRange = React.useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 }
    const prices = products.map(p => p.vlrvenda || 0).filter(p => p > 0)
    if (prices.length === 0) return { min: 0, max: 1000 }
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    }
  }, [products])

  // Current price range
  const currentPriceRange = [
    filters?.priceMin ?? priceRange.min,
    filters?.priceMax ?? priceRange.max
  ]

  const hasActiveFilters = React.useMemo(() => {
    return !!(
      filters?.search ||
      filters?.status !== 'all' ||
      filters?.category ||
      (filters?.priceMin !== undefined && filters.priceMin > priceRange.min) ||
      (filters?.priceMax !== undefined && filters.priceMax < priceRange.max)
    )
  }, [filters, priceRange])

  const handleSearchChange = (value: string) => {
    setFilters({ search: value })
  }

  const handleStatusChange = (value: 'all' | 'active' | 'inactive') => {
    setFilters({ status: value })
  }

  const handleCategoryChange = (value: string) => {
    setFilters({ category: value === 'all' ? '' : value })
  }

  const handlePriceRangeChange = (value: number[]) => {
    setFilters({
      priceMin: value[0] === priceRange.min ? undefined : value[0],
      priceMax: value[1] === priceRange.max ? undefined : value[1]
    })
  }

  const handleClearFilters = () => {
    resetFilters()
  }

  return (
    <div className="space-y-4 p-4 border-b bg-background/50 backdrop-blur-sm">
      {/* Basic filters - always visible */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, nome ou ref. fabricante..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Label htmlFor="status-filter" className="text-sm font-medium">
            Status:
          </Label>
          <Select value={statusValue} onValueChange={handleStatusChange}>
            <SelectTrigger id="status-filter" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1 text-xs">
                    •
                  </Badge>
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Advanced filters - collapsible */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleContent className="space-y-4">
          <Separator />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Category filter */}
            {categories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="category-filter">Categoria</Label>
                <Select 
                  value={filters?.category || 'all'} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Price range filter */}
            <div className="space-y-3 md:col-span-2">
              <Label>Faixa de Preço</Label>
              <div className="px-2">
                <Slider
                  value={currentPriceRange}
                  onValueChange={handlePriceRangeChange}
                  max={priceRange.max}
                  min={priceRange.min}
                  step={Math.max(1, Math.round((priceRange.max - priceRange.min) / 100))}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>R$ {priceRange.min.toFixed(2)}</span>
                  <span className="font-medium text-foreground">
                    R$ {currentPriceRange[0].toFixed(2)} - R$ {currentPriceRange[1].toFixed(2)}
                  </span>
                  <span>R$ {priceRange.max.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active filters summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2">
              {filters?.search && (
                <Badge variant="secondary" className="gap-1">
                  Busca: "{filters.search}"
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleSearchChange('')}
                  />
                </Badge>
              )}
              {filters?.status !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Status: {filters.status === 'active' ? 'Ativos' : 'Inativos'}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleStatusChange('all')}
                  />
                </Badge>
              )}
              {filters?.category && (
                <Badge variant="secondary" className="gap-1">
                  Categoria: {filters.category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleCategoryChange('all')}
                  />
                </Badge>
              )}
              {(filters?.priceMin !== undefined && filters.priceMin > priceRange.min) ||
               (filters?.priceMax !== undefined && filters.priceMax < priceRange.max) ? (
                <Badge variant="secondary" className="gap-1">
                  Preço: R$ {currentPriceRange[0].toFixed(2)} - R$ {currentPriceRange[1].toFixed(2)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handlePriceRangeChange([priceRange.min, priceRange.max])}
                  />
                </Badge>
              ) : null}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default ProductFilters
