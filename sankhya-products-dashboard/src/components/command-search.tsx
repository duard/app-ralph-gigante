"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Command as CommandPrimitive } from "cmdk"
import {
  Search,
  LayoutPanelLeft,
  LayoutDashboard,
  Package,
  BarChart3,
  Filter,
  FileSpreadsheet,
  Download,
  Settings,
  HelpCircle,
  type LucideIcon,
} from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { LoadingState } from "@/components/ui/loading"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useProducts } from "@/hooks/use-products"
import { toast } from "sonner"

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-xl bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50",
      className
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Input
    ref={ref}
    className={cn(
      "flex h-12 w-full border-none bg-transparent px-4 py-3 text-[17px] outline-none placeholder:text-zinc-500 dark:placeholder:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 mb-4",
      className
    )}
    {...props}
  />
))
CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[400px] overflow-y-auto overflow-x-hidden pb-2", className)}
    {...props}
  />
))
CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="flex h-12 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400"
    {...props}
  />
))
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden px-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-zinc-500 dark:[&_[cmdk-group-heading]]:text-zinc-400 [&:not(:first-child)]:mt-2",
      className
    )}
    {...props}
  />
))
CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex h-12 cursor-pointer select-none items-center gap-2 rounded-lg px-4 text-sm text-zinc-700 dark:text-zinc-300 outline-none transition-colors data-[disabled=true]:pointer-events-none data-[selected=true]:bg-zinc-100 dark:data-[selected=true]:bg-zinc-800 data-[selected=true]:text-zinc-900 dark:data-[selected=true]:text-zinc-100 data-[disabled=true]:opacity-50 [&+[cmdk-item]]:mt-1",
      className
    )}
    {...props}
  />
))
CommandItem.displayName = CommandPrimitive.Item.displayName

interface SearchItem {
  title: string
  url?: string
  group: string
  icon?: LucideIcon
  subtitle?: string
  productCode?: number
}

interface CommandSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const navigate = useNavigate()
  const commandRef = React.useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const { searchProducts } = useProducts()

  const staticItems: SearchItem[] = [
    // Dashboards
    { title: "Dashboard", url: "/dashboard", group: "Navegação", icon: LayoutDashboard },
    { title: "Bem-Vindo", url: "/bem-vindo", group: "Navegação", icon: LayoutPanelLeft },

    // Products
    { title: "Lista de Produtos", url: "/produtos", group: "Navegação", icon: Package },
    { title: "Análise de Produtos", url: "/produtos/analise", group: "Navegação", icon: BarChart3 },
    { title: "Filtros Avançados", url: "/produtos/filtros", group: "Navegação", icon: Filter },
    { title: "Exportação de Dados", url: "/produtos/exportar", group: "Navegação", icon: FileSpreadsheet },

    // Other
    { title: "Relatórios", url: "/relatorios", group: "Navegação", icon: Download },
    { title: "Configurações", url: "/configuracoes", group: "Navegação", icon: Settings },
    { title: "Ajuda", url: "/ajuda", group: "Navegação", icon: HelpCircle },
  ]

  const [productResults, setProductResults] = React.useState<SearchItem[]>([])

  // Search products when query changes
  React.useEffect(() => {
    const searchForProducts = async () => {
      if (!searchQuery.trim()) {
        setProductResults([])
        return
      }

      setIsLoading(true)
      try {
        const results = await searchProducts(searchQuery)
        if (results && results.length > 0) {
          const productItems: SearchItem[] = results.map((product) => ({
            title: product.descrprod || `Produto #${product.codprod}`,
            subtitle: `Código: ${product.codprod} | Preço: R$ ${(product.vlrvenda || 0).toFixed(2)}`,
            productCode: product.codprod,
            group: "Produtos",
            icon: Package,
          }))
          setProductResults(productItems)
        } else {
          setProductResults([])
        }
      } catch (error) {
        console.error("Search error:", error)
        toast.error("Erro ao buscar produtos")
        setProductResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(searchForProducts, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchProducts])

  // Combine static items with product results
  const allSearchItems = React.useMemo(() => {
    if (searchQuery.trim()) {
      // Show only product results when searching
      return productResults
    } else {
      // Show static navigation items when not searching
      return staticItems
    }
  }, [searchQuery, productResults])

  const groupedItems = allSearchItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = []
    }
    acc[item.group].push(item)
    return acc
  }, {} as Record<string, SearchItem[]>)

  const handleSelect = (item: SearchItem) => {
    // Bounce effect like Vercel
    if (commandRef.current) {
      commandRef.current.style.transform = 'scale(0.96)'
      setTimeout(() => {
        if (commandRef.current) {
          commandRef.current.style.transform = ''
        }
      }, 100)
    }

    if (item.productCode) {
      // Navigate to product details
      navigate(`/produtos/${item.productCode}`)
      toast.success(`Navegando para ${item.title}`)
    } else if (item.url) {
      // Navigate to regular page
      navigate(item.url)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-[640px]">
        <DialogTitle className="sr-only">Busca Rápida - Sankhya Center</DialogTitle>
        <Command
          ref={commandRef}
          className="transition-transform duration-100 ease-out"
        >
          <CommandInput 
            placeholder="Buscar produtos ou navegar..." 
            autoFocus 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center h-12">
                <LoadingState 
                  type="spinner" 
                  size="sm" 
                  message="Buscando produtos..."
                />
              </div>
            )}
            
            {!isLoading && searchQuery.trim() && productResults.length === 0 && (
              <CommandEmpty>
                Nenhum produto encontrado para "{searchQuery}"
              </CommandEmpty>
            )}
            
            {!isLoading && !searchQuery.trim() && Object.entries(groupedItems).map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.url || item.title}
                      value={item.title}
                      onSelect={() => handleSelect(item)}
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        {item.subtitle && (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
            
            {!isLoading && searchQuery.trim() && productResults.length > 0 && (
              <CommandGroup heading="Produtos">
                {productResults.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.productCode}
                      value={`${item.title} ${item.subtitle}`}
                      onSelect={() => handleSelect(item)}
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        {item.subtitle && (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 relative w-full justify-start text-muted-foreground sm:pr-12 md:w-36 lg:w-56"
        >
          <Search className="mr-2 h-3.5 w-3.5" />
          <span className="hidden lg:inline-flex">Buscar produtos...</span>
          <span className="inline-flex lg:hidden">Buscar...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-4 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Buscar produtos (⌘K)</p>
      </TooltipContent>
    </Tooltip>
  )
}
