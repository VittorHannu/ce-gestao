import { useRef, useEffect, useMemo } from 'react';
import { isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/01-shared/utils/utils';
import { useDateFilter } from '@/01-shared/hooks/useDateFilter';
import { Button } from '@/01-shared/components/ui/button';

const periods = [
  { value: 13, label: '1º Sem' },
  { value: 14, label: '2º Sem' },
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

export default function CompactDateSelector({ children, className }) {
  const { year, periodType, setYear, setPeriodType } = useDateFilter();
  const scrollContainerRef = useRef(null);
  const activePeriodRef = useRef(null);

  const selectedMonthDate = useMemo(() => {
    if (periodType >= 1 && periodType <= 12) {
      return new Date(year, periodType - 1, 1);
    }
    return null;
  }, [year, periodType]);

  useEffect(() => {
    if (activePeriodRef.current) {
      activePeriodRef.current.scrollIntoView({
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

  const handlePeriodClick = (periodValue) => {
    if (periodType === periodValue) {
      setPeriodType(0); // Deselect if the same period is clicked again
    } else {
      setPeriodType(periodValue); // Select the new period
    }
  };

  return (
    <div className={cn("w-full flex flex-col space-y-4", className)}>
      <div className="relative w-full flex items-center justify-center">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => handleYearChange('prev')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-lg font-semibold tabular-nums w-20 text-center">
            {year}
          </div>
          <Button variant="ghost" size="icon" onClick={() => handleYearChange('next')}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute right-0">
          {children}
        </div>
      </div>
      <div ref={scrollContainerRef} className="w-full overflow-x-auto no-scrollbar">
        <div className="flex justify-around">
          {periods.map((period) => {
            const isMonth = period.value >= 1 && period.value <= 12;
            const monthDate = isMonth ? new Date(year, period.value - 1, 1) : null;
            
            let isSelected = false;
            if (isMonth) {
              isSelected = selectedMonthDate && isSameMonth(monthDate, selectedMonthDate);
            } else {
              isSelected = periodType === period.value;
            }

            const isSemester = period.value === 13 || period.value === 14;

            return (
              <div
                key={period.value}
                ref={isSelected ? activePeriodRef : null}
                onClick={() => handlePeriodClick(period.value)}
                className={cn(
                  'snap-center flex-shrink-0 flex flex-col items-center justify-center h-12 rounded-lg cursor-pointer transition-all duration-200 ease-in-out mx-1',
                  {
                    'w-20': isSemester, // Wider for semester labels
                    'w-14': !isSemester,
                    'bg-gray-600 font-bold shadow-md': isSelected,
                    'bg-gray-700 hover:bg-gray-600': !isSelected
                  }
                )}
              >
                <div className="text-sm font-medium uppercase tracking-wider">{period.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
