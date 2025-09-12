import React from 'react';
import { Link } from 'react-router-dom';

import { useRecordeSemAcidentes } from '../hooks/useRecordeSemAcidentes';

const DaysWithoutAccidentsCard = () => {
  const { data: recordeData, isLoading } = useRecordeSemAcidentes();

  if (isLoading) {
    return (
      <div className="bg-gray-200 p-6 rounded-lg shadow-none text-center flex flex-col items-center justify-center animate-pulse h-44">
        <div className="h-12 w-24 bg-gray-300 rounded-md mb-2"></div>
        <div className="h-6 w-48 bg-gray-300 rounded-md mb-2"></div>
        <div className="h-4 w-32 bg-gray-300 rounded-md"></div>
        <div className="h-4 w-24 bg-gray-300 rounded-md mt-2"></div>
      </div>
    );
  }

  // Extrai os dados da resposta da RPC, com fallback para 0 ou null
  const diasAtuais = recordeData?.[0]?.dias_atuais_sem_acidentes ?? 0;
  const recordeDias = recordeData?.[0]?.recorde_dias_sem_acidentes ?? 0;
  

  return (
    <Link to="/relatos/acidentes-graves" className="block bg-teal-600 p-4 rounded-lg shadow-none flex flex-col items-center justify-center text-white text-center md:h-fit hover:bg-teal-700 transition-colors duration-200">
      <h2 className="text-4xl font-bold">
        {diasAtuais}
        {recordeDias > 0 && diasAtuais <= recordeDias && (
          <span className="text-2xl font-bold text-teal-300 align-middle"> / {recordeDias}</span>
        )}
      </h2>
      <p className="text-base font-semibold mt-2">dias sem acidentes com afastamento</p>
    </Link>
  );
};

export default DaysWithoutAccidentsCard;
