import React from 'react';
import DateFilter from '@/01-shared/components/DateFilter';


const TotalReportsCard = ({ totalReports }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-around col-span-2">
      <div className="flex flex-col items-center justify-center">
        <DateFilter />
      </div>
      <div className="w-px bg-gray-300 h-16"></div>
      <div className="flex flex-col items-center justify-center">
        <div className="h-9 flex flex-col justify-center items-center">
          <h2 className="text-base font-semibold text-gray-600">Total de Relatos</h2>
          <p className="text-3xl font-bold text-gray-900">{totalReports}</p>
        </div>
      </div>
    </div>
  );
};

export default TotalReportsCard;
