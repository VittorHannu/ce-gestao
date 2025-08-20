import React from 'react';
import DateFilter from '@/01-shared/components/DateFilter';
import { Card, CardContent } from '@/01-shared/components/ui/card';

const DateFilterCard = () => {
  return (
    <Card className="flex flex-col justify-between p-4 h-full">
      <CardContent className="p-0 flex flex-col items-center justify-center h-full">
        <DateFilter />
      </CardContent>
    </Card>
  );
};

export default DateFilterCard;
