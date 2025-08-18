import React from 'react';
import { useDateFilter } from '@/01-shared/hooks/useDateFilter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/01-shared/components/ui/select';

const DateFilter = () => {
  const { year, setYear, periodType, setPeriodType } = useDateFilter();

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2]; // Mostra os últimos 3 anos

  const periodOptions = [
    { value: 0, label: 'Ano Todo', isBold: true }, // Bold
    { value: 13, label: '1º Semestre', isBold: true }, // Bold
    { value: 14, label: '2º Semestre', isBold: true }, // Bold
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col justify-between">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-600 mb-1">Filtrar por Período</p>

        {/* Year Selector (always visible) */}
        <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value, 10))}>
          <SelectTrigger className="w-full border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* NEW: Combined Month/Semester/Year Selector */}
        <Select value={periodType.toString()} onValueChange={(value) => setPeriodType(parseInt(value, 10))}>
          <SelectTrigger className="w-full border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map(option => (
              <SelectItem
                key={option.value}
                value={option.value.toString()}
                className={option.isBold ? 'font-bold' : ''} // Apply font-bold class
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DateFilter;
