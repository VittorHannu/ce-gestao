import React from 'react';

const TotalReportsCard = ({ totalReports }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 h-full flex flex-col justify-between gap-2 hover:shadow-md transition-shadow duration-300">
      <div>
        <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
      </div>
      <p className="text-base font-semibold text-gray-600">Total de Relatos</p>
    </div>
  );
};

export default TotalReportsCard;
