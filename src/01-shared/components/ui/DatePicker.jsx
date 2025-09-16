'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/01-shared/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/01-shared/components/ui/popover';

export function DatePicker({ value, onChange, className }) {
  const [date, setDate] = React.useState(value ? new Date(value) : null);

  React.useEffect(() => {
    setDate(value ? new Date(value) : null);
  }, [value]);

  const handleSelect = (selectedDate) => {
    setDate(selectedDate);
    // Format date to YYYY-MM-DD for consistency with <input type="date">
    onChange(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
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
