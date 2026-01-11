"use client"

import * as React from "react"
import { 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  RotateCcw 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useProductsStore } from "@/stores/products-store"
import { useProducts } from "@/hooks/use-products"
import { cn } from "@/lib/utils"

interface ProductFiltersSidebarProps {
  className?: string
  children?: React.ReactNode
}

export function ProductFiltersSidebar({ className, children }: ProductFiltersSidebarProps) {
  const { filters, setFilters, resetFilters } = useProductsStore()
  const { products } = useProducts()
  const [isOpen, setIsOpen] = React.useState(false)
  
  // Collapsible sections state
  const [basicFiltersOpen, setBasicFiltersOpen] = React.useState(true)
  const [priceFiltersOpen, setPriceFiltersOpen] = React.useState(true)
  const [categoryFiltersOpen, setCategoryFiltersOpen] = React.useState(true)
  
  const searchValue = filters?.search ?? ""
  const statusValue = filters?.status ?? 'all'

  // Get unique categories from products
  const categories = React.useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map(p => p.descrgrupoprod).filter(Boolean))
    ).sort()
    return uniqueCategories
  }, [products])

  // Get unique units from products
  const units = React.useMemo(() => {
    const uniqueUnits = Array.from(
      new Set(products.map(p => p.codvol).filter(Boolean))
    ).sort()
    return uniqueUnits
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
      filters?.unit ||
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

  const handleUnitChange = (value: string) => {
    setFilters({ unit: value === 'all' ? '' : value })
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

  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    if (filters?.search) count++
    if (filters?.status !== 'all') count++
    if (filters?.category) count++
    if (filters?.unit) count++
    if ((filters?.priceMin !== undefined && filters.priceMin > priceRange.min) ||
        (filters?.priceMax !== undefined && filters.priceMax < priceRange.max)) count++
    return count
  }, [filters, priceRange])

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <h3 className="font-semibold">Filtros Avançados</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 px-2"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Basic Filters */}
        <Collapsible open={basicFiltersOpen} onOpenChange={setBasicFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-8">
              <span className="font-medium">Filtros Básicos</span>
              {basicFiltersOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-2">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="sidebar-search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="sidebar-search"
                  placeholder="Código, nome ou ref. fabricante..."
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
                {searchValue && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => handleSearchChange('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Status filter */}
            <div className="space-y-2">
              <Label htmlFor="sidebar-status">Status</Label>
              <Select value={statusValue} onValueChange={handleStatusChange}>
                <SelectTrigger id="sidebar-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Category Filters */}
        <Collapsible open={categoryFiltersOpen} onOpenChange={setCategoryFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-8">
              <span className="font-medium">Categoria & Unidade</span>
              {categoryFiltersOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-2">
            {/* Category filter */}
            {categories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="sidebar-category">Categoria</Label>
                <Select 
                  value={filters?.category || 'all'} 
                  onValueChange={(value) => handleCategoryChange(value || '')}
                >
                  <SelectTrigger id="sidebar-category">
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

            {/* Unit filter */}
            {units.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="sidebar-unit">Unidade</Label>
                <Select 
                  value={filters?.unit || 'all'} 
                  onValueChange={(value) => handleUnitChange(value || '')}
                >
                  <SelectTrigger id="sidebar-unit">
                    <SelectValue placeholder="Todas as unidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as unidades</SelectItem>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Price Filters */}
        <Collapsible open={priceFiltersOpen} onOpenChange={setPriceFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-8">
              <span className="font-medium">Faixa de Preço</span>
              {priceFiltersOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-2">
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
          </CollapsibleContent>
        </Collapsible>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Filtros Ativos</Label>
              <div className="flex flex-wrap gap-2">
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
                    Cat: {filters.category}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleCategoryChange('all')}
                    />
                  </Badge>
                )}
                {filters?.unit && (
                  <Badge variant="secondary" className="gap-1">
                    Un: {filters.unit}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleUnitChange('all')}
                    />
                  </Badge>
                )}
                {(filters?.priceMin !== undefined && filters.priceMin > priceRange.min) ||
                 (filters?.priceMax !== undefined && filters.priceMax < priceRange.max) ? (
                  <Badge variant="secondary" className="gap-1">
                    R$ {currentPriceRange[0].toFixed(2)} - R$ {currentPriceRange[1].toFixed(2)}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handlePriceRangeChange([priceRange.min, priceRange.max])}
                    />
                  </Badge>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer with results count */}
      <div className="p-4 border-t bg-muted/20">
        <div className="text-sm text-muted-foreground">
          {products.length > 0 ? (
            <span>Mostrando {products.length} produtos</span>
          ) : (
            <span>Nenhum produto encontrado</span>
          )}
        </div>
      </div>
    </div>
  )

  // If children provided, render as children (simplified)
  if (children) {
    return <>{children}</>
  }

  // Otherwise, render as standalone sidebar
  return (
    <div className={cn("w-full sm:w-80 border bg-background", className)}>
      {content}
    </div>
  )
}

export default ProductFiltersSidebar