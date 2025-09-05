import React from 'react';
import { Link } from 'react-router-dom';
import { differenceInCalendarDays, format } from 'date-fns';


const DaysWithoutAccidentsCard = ({ lastAccidentDate, isLoading }) => {
  if (isLoading) {
    // Skeleton loader
    return (
      <div className="bg-gray-200 p-6 rounded-lg shadow-none text-center flex flex-col items-center justify-center animate-pulse">
        <div className="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
        <div className="h-12 w-24 bg-gray-300 rounded-md mb-2"></div>
        <div className="h-6 w-48 bg-gray-300 rounded-md"></div>
      </div>
    );
  }

  const today = new Date();
  let daysSinceLastAccident = 0;
  let footerText = 'Continue o bom trabalho!';

  if (lastAccidentDate) {
    daysSinceLastAccident = differenceInCalendarDays(today, new Date(lastAccidentDate));
    footerText = `Último acidente em: ${format(new Date(lastAccidentDate), 'dd/MM/yyyy')}`;
  } else {
    daysSinceLastAccident = 'Recorde';
    footerText = 'Nenhum acidente com afastamento registrado!';
  }

  return (
    <div className="bg-teal-600 p-6 rounded-lg shadow-none flex flex-col justify-center text-white">
      <div className="flex items-center justify-center gap-4">
        <h2 className="text-5xl font-bold">
          {daysSinceLastAccident}
        </h2>
        <p className="text-lg font-semibold text-left">dias sem acidentes com afastamento</p>
      </div>
      <p className="text-sm text-teal-100 mt-4 text-center">
        {lastAccidentDate ? (
          <Link to="/relatos/acidentes-graves" className="underline">
            {footerText}
          </Link>
        ) : (
          footerText
        )}
      </p>
    </div>
  );
};

export default DaysWithoutAccidentsCard;