import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export interface MultiSelectOption {
  value: number | string;
  label: string;
}

interface MultiSelectFilterProps {
  options: MultiSelectOption[];
  value: (number | string)[];
  onChange: (value: (number | string)[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  isLoading?: boolean;
}

export function MultiSelectFilter({
  options,
  value,
  onChange,
  placeholder = 'Selecionar...',
  label,
  className,
  isLoading = false,
}: MultiSelectFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const handleSelect = (optionValue: number | string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((opt) => opt.value));
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const selectedLabels = options.filter((opt) => value.includes(opt.value)).map((opt) => opt.label);

  const displayText =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? selectedLabels[0]
        : `${value.length} selecionados`;

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <label className="text-sm font-medium">{label}</label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading}
          >
            <span className="truncate">{displayText}</span>
            <div className="flex items-center gap-1">
              {value.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {value.length}
                </Badge>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              <CommandGroup>
                <CommandItem onSelect={handleSelectAll} className="cursor-pointer">
                  <div className="flex items-center gap-2 w-full">
                    <Check
                      className={cn(
                        'h-4 w-4',
                        value.length === options.length ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="font-medium">
                      {value.length === options.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                    </span>
                  </div>
                </CommandItem>
              </CommandGroup>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value.includes(option.value) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          {value.length > 0 && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={handleClear}
              >
                <X className="mr-1 h-3 w-3" />
                Limpar Seleção
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Badges de itens selecionados */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedLabels.slice(0, 3).map((label, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {label}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => {
                  const optionToRemove = options.find((opt) => opt.label === label);
                  if (optionToRemove) {
                    handleSelect(optionToRemove.value);
                  }
                }}
              />
            </Badge>
          ))}
          {value.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{value.length - 3} mais
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
