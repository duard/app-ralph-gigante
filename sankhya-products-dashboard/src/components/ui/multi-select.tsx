import { useState, useEffect } from 'react';
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
import { cn } from '@/lib/utils';
import { Check, X, ChevronDown } from 'lucide-react';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecione opções...',
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedOptions = options.filter((option) => value.includes(option.value));

  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleClear = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  // Reset the open state when component is disabled
  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between text-left',
            !value.length && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <div className="flex flex-1 flex-wrap gap-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <div
                  key={option.value}
                  className="bg-primary text-primary-foreground rounded-md px-2 py-0.5 text-xs flex items-center gap-1"
                >
                  <span>{option.label}</span>
                  <button
                    type="button"
                    className="ml-1 rounded-full hover:bg-primary-foreground/20"
                    onClick={(e) => handleClear(option.value, e)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
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
      </PopoverContent>
    </Popover>
  );
}
