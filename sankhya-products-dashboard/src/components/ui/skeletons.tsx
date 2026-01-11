
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ rows = 5, columns = 6, className }: TableSkeletonProps) {
  return (
    <div className={className}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex gap-4 p-4 border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 flex-1" />
          ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex gap-4 p-4 border-b">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

interface CardSkeletonProps {
  lines?: number
  showHeader?: boolean
  className?: string
}

export function CardSkeleton({ lines = 3, showHeader = true, className }: CardSkeletonProps) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className={`h-4 ${i === 0 ? "w-full" : "w-3/4"}`} />
            {i < lines - 1 && <Skeleton className="h-3 w-1/2" />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface ListItemSkeletonProps {
  items?: number
  showAvatar?: boolean
  className?: string
}

export function ListItemSkeleton({ items = 5, showAvatar = false, className }: ListItemSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3 border rounded">
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

interface DashboardCardSkeletonProps {
  className?: string
}

export function DashboardCardSkeleton({ className }: DashboardCardSkeletonProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

interface ChartSkeletonProps {
  className?: string
  showLegend?: boolean
}

export function ChartSkeleton({ className, showLegend = true }: ChartSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        {showLegend && <Skeleton className="h-4 w-48" />}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart area */}
          <div className="h-64 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-end gap-2 h-16">
                <Skeleton className="h-full flex-1" />
                <Skeleton className="h-3/4 flex-1" />
                <Skeleton className="h-1/2 flex-1" />
                <Skeleton className="h-2/3 flex-1" />
              </div>
            ))}
          </div>
          
          {/* X-axis labels */}
          <div className="flex justify-between">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-8" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface FormSkeletonProps {
  fields?: number
  className?: string
}

export function FormSkeleton({ fields = 6, className }: FormSkeletonProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

interface ProductListSkeletonProps {
  view?: "table" | "grid"
  items?: number
  className?: string
}

export function ProductListSkeleton({ view = "table", items = 8, className }: ProductListSkeletonProps) {
  if (view === "grid") {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: items }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-video bg-gray-100">
              <Skeleton className="h-full w-full" />
            </div>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return <TableSkeleton rows={items} columns={7} className={className} />
}

// Export all skeletons as a namespace for convenience
export const Skeletons = {
  Table: TableSkeleton,
  Card: CardSkeleton,
  ListItem: ListItemSkeleton,
  DashboardCard: DashboardCardSkeleton,
  Chart: ChartSkeleton,
  Form: FormSkeleton,
  ProductList: ProductListSkeleton,
}