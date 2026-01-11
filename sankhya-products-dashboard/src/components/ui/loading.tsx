import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeletons } from "./skeletons"

interface LoadingStateProps {
  type?: "spinner" | "skeleton" | "pulse"
  size?: "sm" | "md" | "lg" | "full"
  message?: string
  className?: string
  children?: React.ReactNode
}

export function LoadingState({ 
  type = "spinner", 
  size = "md", 
  message, 
  className,
  children 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12",
    full: "h-16 w-16"
  }

  const containerSizeClasses = {
    sm: "min-h-[20px]",
    md: "min-h-[100px]",
    lg: "min-h-[200px]",
    full: "min-h-[400px]"
  }

  if (type === "spinner") {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center gap-3",
        containerSizeClasses[size],
        className
      )}>
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        {message && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {message}
          </p>
        )}
      </div>
    )
  }

  if (type === "skeleton") {
    return <div className={className}>{children}</div>
  }

  if (type === "pulse") {
    return (
      <div className={cn(
        "animate-pulse bg-muted rounded-md",
        containerSizeClasses[size],
        className
      )}>
        {children}
      </div>
    )
  }

  return null
}

interface LoadingProps {
  isLoading: boolean
  error?: Error | null
  type?: LoadingStateProps["type"]
  size?: LoadingStateProps["size"]
  message?: string
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function Loading({ 
  isLoading, 
  error, 
  type = "skeleton", 
  size = "md", 
  message = "Carregando...",
  fallback,
  errorFallback,
  className,
  children 
}: LoadingProps) {
  if (error) {
    if (errorFallback) {
      return <>{errorFallback}</>
    }
    
    return (
      <div className={cn(
        "flex flex-col items-center justify-center gap-3 p-6 text-center",
        className
      )}>
        <div className="rounded-full bg-destructive/10 p-3">
          <Loader2 className="h-6 w-6 text-destructive animate-spin" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Erro ao carregar</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {error.message || "Ocorreu um erro inesperado"}
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <LoadingState 
        type={type} 
        size={size} 
        message={message}
        className={className}
      >
        {fallback}
      </LoadingState>
    )
  }

  return <>{children}</>
}

// Specific loading components for common patterns
export function TableLoading({ isLoading, error, className }: { 
  isLoading: boolean
  error?: Error | null
  className?: string
}) {
  return (
    <Loading
      isLoading={isLoading}
      error={error}
      fallback={<Skeletons.Table className={className} />}
      className={className}
    >
      <></>
    </Loading>
  )
}

export function CardLoading({ 
  isLoading, 
  error, 
  lines = 3, 
  showHeader = true, 
  className 
}: { 
  isLoading: boolean
  error?: Error | null
  lines?: number
  showHeader?: boolean
  className?: string
}) {
  return (
    <Loading
      isLoading={isLoading}
      error={error}
      fallback={<Skeletons.Card lines={lines} showHeader={showHeader} className={className} />}
      className={className}
    >
      <></>
    </Loading>
  )
}

export function DashboardCardLoading({ isLoading, error, className }: { 
  isLoading: boolean
  error?: Error | null
  className?: string
}) {
  return (
    <Loading
      isLoading={isLoading}
      error={error}
      fallback={<Skeletons.DashboardCard className={className} />}
      className={className}
    >
      <></>
    </Loading>
  )
}

export function ChartLoading({ isLoading, error, showLegend = true, className }: { 
  isLoading: boolean
  error?: Error | null
  showLegend?: boolean
  className?: string
}) {
  return (
    <Loading
      isLoading={isLoading}
      error={error}
      fallback={<Skeletons.Chart showLegend={showLegend} className={className} />}
      className={className}
    >
      <></>
    </Loading>
  )
}

export function ProductListLoading({ 
  isLoading, 
  error, 
  view = "table" as const, 
  items = 8, 
  className 
}: { 
  isLoading: boolean
  error?: Error | null
  view?: "table" | "grid"
  items?: number
  className?: string
}) {
  return (
    <Loading
      isLoading={isLoading}
      error={error}
      fallback={<Skeletons.ProductList view={view} items={items} className={className} />}
      className={className}
    >
      <></>
    </Loading>
  )
}