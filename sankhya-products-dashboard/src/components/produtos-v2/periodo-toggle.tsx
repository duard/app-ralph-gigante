import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { PeriodoPreset } from '@/stores/dashboard-filters-store';

interface PeriodoToggleProps {
  value: PeriodoPreset;
  onChange: (value: PeriodoPreset) => void;
  className?: string;
}

const periodoOptions: { value: PeriodoPreset; label: string }[] = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
  { value: 'trimestre', label: 'Trimestre' },
  { value: 'ano', label: 'Ano' },
  { value: 'custom', label: 'Personalizado' },
];

export function PeriodoToggle({ value, onChange, className }: PeriodoToggleProps) {
  return (
    <div className={className}>
      <label className="text-sm font-medium mb-2 block">Período</label>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(val) => {
          if (val) onChange(val as PeriodoPreset);
        }}
        className="flex flex-wrap gap-2 justify-start"
      >
        {periodoOptions.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            aria-label={`Filtrar por ${option.label.toLowerCase()}`}
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
