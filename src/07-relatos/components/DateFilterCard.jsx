import React from 'react';
import DateFilter from '@/01-shared/components/DateFilter';
import { Card, CardContent } from '@/01-shared/components/ui/card';

const DateFilterCard = () => {
  return (
    <Card className="p-4 shadow-sm">
      <CardContent className="p-0 flex items-center justify-center w-full">
        <div className="flex flex-row items-center gap-4 w-full">
          <span className="font-bold">Período</span>
          <div className="flex-grow">
            <DateFilter />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DateFilterCard;
