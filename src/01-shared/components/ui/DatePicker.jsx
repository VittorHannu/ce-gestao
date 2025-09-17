'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, X as XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/01-shared/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/01-shared/components/ui/popover';

export function DatePicker({ value, onChange, className, disabled }) {
  const [date, setDate] = React.useState(value ? new Date(value) : null);

  React.useEffect(() => {
    const parsedDate = value ? new Date(value) : null;
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      setDate(parsedDate);
    } else {
      setDate(null);
    }
  }, [value]);

  const handleSelect = (selectedDate) => {
    setDate(selectedDate);
    onChange(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    handleSelect(null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal relative', // Added relative
            !date && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="flex-grow">
            {date ? format(date, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
          </span>
          {date && !disabled && (
            <XIcon
              className="h-4 w-4 text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2"
              onClick={handleClear}
              aria-label="Limpar data"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
}
