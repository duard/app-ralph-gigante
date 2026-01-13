import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, parse, isValid } from 'date-fns';

interface DateRangePickerProps {
  startDate: string; // ISO format (YYYY-MM-DD)
  endDate: string; // ISO format (YYYY-MM-DD)
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
}: DateRangePickerProps) {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    onStartDateChange(newDate);

    // Se a data inicial for maior que a final, ajustar a final
    if (newDate > endDate) {
      onEndDateChange(newDate);
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    onEndDateChange(newDate);

    // Se a data final for menor que a inicial, ajustar a inicial
    if (newDate < startDate) {
      onStartDateChange(newDate);
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">Data Inicial</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={handleStartChange}
            max={endDate}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date">Data Final</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={handleEndChange}
            min={startDate}
            max={format(new Date(), 'yyyy-MM-dd')} // Não pode ser futura
          />
        </div>
      </div>
    </div>
  );
}
