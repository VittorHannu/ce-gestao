import { useRef, useEffect, useMemo } from 'react';
import { isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/01-shared/utils/utils';
import { useDateFilter } from '@/01-shared/hooks/useDateFilter';
import { Button } from '@/01-shared/components/ui/button';

const months = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Fev' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Abr' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Ago' },
  { value: 9, label: 'Set' },
  { value: 10, label: 'Out' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dez' }
];

export default function CompactDateSelector({ children }) {
  const { year, periodType, setYear, setPeriodType } = useDateFilter();
  const scrollContainerRef = useRef(null);
  const activeMonthRef = useRef(null);

  const selectedMonthDate = useMemo(() => {
    if (periodType >= 1 && periodType <= 12) {
      return new Date(year, periodType - 1, 1);
    }
    return null;
  }, [year, periodType]);

  useEffect(() => {
    if (activeMonthRef.current) {
      activeMonthRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [periodType, year]);

  const handleYearChange = (direction) => {
    const newYear = direction === 'next' ? year + 1 : year - 1;
    setYear(newYear);
  };

  const handleMonthClick = (monthValue) => {
    setPeriodType(monthValue);
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center justify-center">
          <Button variant="ghost" size="icon" onClick={() => handleYearChange('prev')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-lg font-semibold tabular-nums w-24 text-center">
            {year}
          </div>
          <Button variant="ghost" size="icon" onClick={() => handleYearChange('next')}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div>
          {children}
        </div>
      </div>
      <div ref={scrollContainerRef} className="w-full overflow-x-auto no-scrollbar">
        <div className="flex justify-around">
          {months.map((month) => {
            const monthDate = new Date(year, month.value - 1, 1);
            const isSelected = selectedMonthDate && isSameMonth(monthDate, selectedMonthDate);
            return (
              <div
                key={month.value}
                ref={isSelected ? activeMonthRef : null}
                onClick={() => handleMonthClick(month.value)}
                className={cn(
                  'snap-center flex-shrink-0 flex flex-col items-center justify-center w-14 h-12 rounded-lg cursor-pointer transition-all duration-200 ease-in-out mx-1',
                  {
                    'bg-primary text-primary-foreground font-bold shadow-md': isSelected,
                    'bg-muted/50 text-muted-foreground hover:bg-muted': !isSelected
                  }
                )}
              >
                <div className="text-sm font-medium uppercase tracking-wider">{month.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
