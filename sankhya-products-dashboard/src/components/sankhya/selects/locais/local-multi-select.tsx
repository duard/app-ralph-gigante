import { useMemo, useState } from 'react'
import { Check, Loader2, MapPin, X } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLocais } from '@/hooks/produtos-v2/use-grupos-locais'
import { cn } from '@/lib/utils'
import type { LocalMultiSelectProps } from './types'

/**
 * Componente de seleção múltipla de locais
 *
 * @example
 * ```tsx
 * <LocalMultiSelect
 *   value={selectedLocais}
 *   onChange={setSelectedLocais}
 *   placeholder="Selecione locais"
 *   showCount
 *   maxSelections={5}
 * />
 * ```
 */
export function LocalMultiSelect({
  value = [],
  onChange,
  disabled = false,
  placeholder = 'Selecione locais',
  className,
  showLoadingIcon = true,
  showCount = true,
  maxSelections,
  filterLocais,
}: LocalMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const { data: locais = [], isLoading, error } = useLocais()

  // Filtra os locais se houver filtro customizado
  const filteredLocais = useMemo(() => {
    if (!filterLocais) return locais
    return locais.filter(filterLocais)
  }, [locais, filterLocais])

  // Encontra os locais selecionados
  const selectedLocais = useMemo(() => {
    return filteredLocais.filter((local) => value.includes(local.codlocal))
  }, [value, filteredLocais])

  // Handle toggle
  const handleToggle = (codlocal: number) => {
    const isSelected = value.includes(codlocal)

    if (isSelected) {
      // Remove da seleção
      onChange?.(value.filter((id) => id !== codlocal))
    } else {
      // Adiciona à seleção (se não atingiu o limite)
      if (maxSelections && value.length >= maxSelections) {
        return // Não permite mais seleções
      }
      onChange?.([...value, codlocal])
    }
  }

  // Handle clear all
  const handleClearAll = () => {
    onChange?.([])
    setOpen(false)
  }

  // Handle select all
  const handleSelectAll = () => {
    const allCodigos = filteredLocais.map((local) => local.codlocal)

    if (maxSelections) {
      onChange?.(allCodigos.slice(0, maxSelections))
    } else {
      onChange?.(allCodigos)
    }
  }

  // Texto do trigger
  const triggerText = useMemo(() => {
    if (selectedLocais.length === 0) {
      return placeholder
    }

    if (selectedLocais.length === 1) {
      const local = selectedLocais[0]
      return local.descrlocal || `Local ${local.codlocal}`
    }

    return `${selectedLocais.length} ${selectedLocais.length === 1 ? 'local' : 'locais'}`
  }, [selectedLocais, placeholder])

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <MapPin className="h-4 w-4" />
        <span>Erro ao carregar locais</span>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className={cn(
            'w-full justify-between font-normal',
            value.length === 0 && 'text-muted-foreground',
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
          {showCount && value.length > 0 && (
            <Badge variant="secondary" className="ml-2 flex-shrink-0">
              {value.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        {/* Header com ações */}
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">
            Locais
            {maxSelections && (
              <span className="text-muted-foreground ml-1">
                (máx. {maxSelections})
              </span>
            )}
          </span>
          <div className="flex items-center gap-1">
            {value.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-7 text-xs"
              >
                Limpar
              </Button>
            )}
            {filteredLocais.length > 0 && value.length < filteredLocais.length && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-7 text-xs"
                disabled={maxSelections ? value.length >= maxSelections : false}
              >
                Todos
              </Button>
            )}
          </div>
        </div>

        {/* Lista de locais */}
        <ScrollArea className="h-[300px]">
          {filteredLocais.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {isLoading ? 'Carregando...' : 'Nenhum local encontrado'}
            </div>
          ) : (
            <div className="p-2">
              {filteredLocais.map((local) => {
                const isSelected = value.includes(local.codlocal)
                const isDisabled =
                  maxSelections &&
                  !isSelected &&
                  value.length >= maxSelections

                return (
                  <div
                    key={local.codlocal}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2 py-2 cursor-pointer hover:bg-accent transition-colors',
                      isSelected && 'bg-accent/50',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={() => !isDisabled && handleToggle(local.codlocal)}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      className="pointer-events-none"
                    />
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">
                        {local.descrlocal || `Local ${local.codlocal}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        #{local.codlocal}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer com contador */}
        {showCount && value.length > 0 && (
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            {value.length} {value.length === 1 ? 'local selecionado' : 'locais selecionados'}
            {maxSelections && ` de ${maxSelections}`}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
