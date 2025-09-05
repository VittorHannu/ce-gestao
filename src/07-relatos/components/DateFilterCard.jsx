import React from 'react';
import CompactDateSelector from '@/01-shared/components/CompactDateSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/01-shared/components/ui/card';

const DateFilterCard = () => {
  return (
    <Card className="shadow-sm w-full">
      <CardHeader>
        <CardTitle>Filtrar por Período</CardTitle>
      </CardHeader>
      <CardContent>
        <CompactDateSelector />
      </CardContent>
    </Card>
  );
};

export default DateFilterCard;