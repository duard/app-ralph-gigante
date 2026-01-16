import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown, Loader2, MapPin, Search, X } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { useLocais } from '@/hooks/produtos-v2/use-grupos-locais'
import { cn } from '@/lib/utils'
import type { LocalComboboxProps } from './types'

/**
 * Componente Combobox de local com busca
 * Permite pesquisar e selecionar um local com autocomplete
 *
 * @example
 * ```tsx
 * <LocalCombobox
 *   value={selectedLocal}
 *   onChange={setSelectedLocal}
 *   placeholder="Buscar local..."
 *   clearable
 *   emptyMessage="Nenhum local encontrado"
 * />
 * ```
 */
export function LocalCombobox({
  value,
  onChange,
  disabled = false,
  placeholder = 'Buscar local...',
  className,
  clearable = true,
  showLoadingIcon = true,
  emptyMessage = 'Nenhum local encontrado',
  caseSensitive = false,
  filterLocais,
}: LocalComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { data: locais = [], isLoading, error } = useLocais()

  // Filtra os locais se houver filtro customizado
  const filteredLocais = useMemo(() => {
    if (!filterLocais) return locais
    return locais.filter(filterLocais)
  }, [locais, filterLocais])

  // Encontra o local selecionado
  const selectedLocal = useMemo(() => {
    if (!value) return null
    return filteredLocais.find((local) => local.codlocal === value)
  }, [value, filteredLocais])

  // Handle select
  const handleSelect = (codlocal: number) => {
    if (value === codlocal) {
      // Se já está selecionado e é clearable, limpa
      if (clearable) {
        onChange?.(null)
      }
    } else {
      onChange?.(codlocal)
    }
    setOpen(false)
    setSearch('')
  }

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(null)
  }

  // Texto do trigger
  const triggerText = useMemo(() => {
    if (selectedLocal) {
      return selectedLocal.descrlocal || `Local ${selectedLocal.codlocal}`
    }
    return placeholder
  }, [selectedLocal, placeholder])

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <MapPin className="h-4 w-4" />
        <span>Erro ao carregar locais</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || isLoading}
            className={cn(
              'w-full justify-between font-normal',
              !value && 'text-muted-foreground',
              className
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {isLoading && showLoadingIcon ? (
                <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
              ) : (
                <MapPin className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="truncate">{triggerText}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Buscar local..."
                value={search}
                onValueChange={setSearch}
                className="flex-1"
              />
            </div>
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {filteredLocais
                  .filter((local) => {
                    if (!search) return true
                    const searchTerm = caseSensitive ? search : search.toLowerCase()
                    const localDescr = caseSensitive
                      ? local.descrlocal
                      : local.descrlocal?.toLowerCase()
                    const localCode = local.codlocal.toString()

                    return (
                      localDescr?.includes(searchTerm) ||
                      localCode.includes(searchTerm)
                    )
                  })
                  .map((local) => (
                    <CommandItem
                      key={local.codlocal}
                      value={local.codlocal.toString()}
                      onSelect={() => handleSelect(local.codlocal)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === local.codlocal ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">
                          {local.descrlocal || `Local ${local.codlocal}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          #{local.codlocal}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Clear button */}
      {clearable && value && !disabled && !isLoading && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
          onClick={handleClear}
        >
          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </Button>
      )}
    </div>
  )
}
