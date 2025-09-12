import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useRecordeSemAcidentes } from '../hooks/useRecordeSemAcidentes';

const DaysWithoutAccidentsCard = () => {
  const { data: recordeData, isLoading } = useRecordeSemAcidentes();

  if (isLoading) {
    return (
      <div className="bg-gray-200 p-6 rounded-lg shadow-none text-center flex flex-col items-center justify-center animate-pulse aspect-square">
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
  const ultimoAcidente = recordeData?.[0]?.data_ultimo_acidente;

  const footerText = ultimoAcidente
    ? `Último em: ${format(new Date(ultimoAcidente), 'dd/MM/yyyy')}`
    : 'Nenhum acidente registrado!';

  return (
    <div className="bg-teal-600 p-4 rounded-lg shadow-none flex flex-col items-center justify-center text-white text-center aspect-square">
      <h2 className="text-4xl font-bold">
        {diasAtuais}
      </h2>
      <p className="text-base font-semibold mt-2">dias sem acidentes com afastamento</p>
      <p className="text-sm text-teal-100 mt-2">
        {ultimoAcidente ? (
          <Link to="/relatos/acidentes-graves" className="underline">
            {footerText}
          </Link>
        ) : (
          footerText
        )}
      </p>
      {recordeDias > 0 && (
        <p className="text-sm text-teal-100 mt-2">
          {`Recorde: ${recordeDias} dias`}
        </p>
      )}
    </div>
  );
};

export default DaysWithoutAccidentsCard;
