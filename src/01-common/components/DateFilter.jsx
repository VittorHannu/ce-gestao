import React from 'react';
import { useDateFilter } from '@/01-common/hooks/useDateFilter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';

const DateFilter = () => {
  const { year, setYear, semester, setSemester } = useDateFilter();

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2]; // Mostra os últimos 3 anos

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 w-full flex-wrap">
        <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value, 10))}>
          <SelectTrigger className="w-auto border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={semester.toString()} onValueChange={(value) => setSemester(parseInt(value, 10))}>
          <SelectTrigger className="w-auto border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
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
