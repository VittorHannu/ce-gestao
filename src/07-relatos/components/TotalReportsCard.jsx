import React from 'react';
import { Card, CardContent } from '@/01-shared/components/ui/card';

const TotalReportsCard = ({ totalReports }) => {
  return (
    <Card className="flex flex-col justify-between p-4 h-full shadow-sm">
      <CardContent className="p-0 flex flex-col items-center justify-center h-full">
        <h3 className="text-base font-semibold text-gray-600">Total de Relatos</h3>
        <p className="text-3xl font-bold text-gray-900">{totalReports}</p>
      </CardContent>
    </Card>
  );
};

export default TotalReportsCard;
