import React from 'react';
import { useDateFilter } from '@/01-shared/hooks/useDateFilter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/01-shared/components/ui/select';

const DateFilter = () => {
  const { year, setYear, semester, setSemester } = useDateFilter();

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2]; // Mostra os últimos 3 anos

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col justify-between">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-600 mb-1">Filtrar por Período</p>
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

        <Select value={semester.toString()} onValueChange={(value) => setSemester(parseInt(value, 10))}>
          <SelectTrigger className="w-full border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
            <SelectValue placeholder="Semestre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Ano Todo</SelectItem>
            <SelectItem value="1">1º Semestre</SelectItem>
            <SelectItem value="2">2º Semestre</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DateFilter;
