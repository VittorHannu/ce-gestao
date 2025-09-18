
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Button } from '@/01-shared/components/ui/button';

const RelatoConfirmationPage = () => {
  const location = useLocation();
  const { submissionData } = location.state || {};

  if (!submissionData) {
    // Handle case where user navigates directly to this page
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">Nenhuma informação de relato encontrada.</h1>
        <p>Parece que você acessou esta página diretamente. Por favor, envie um relato para ver esta página.</p>
        <Button asChild className="mt-4">
          <Link to="/relatos/new">Criar novo Relato</Link>
        </Button>
      </div>
    );
  }

  const { relatoId, relatoData } = submissionData;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow-lg rounded-lg p-8 text-center">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Relato Enviado com Sucesso!</h1>
        <p className="text-gray-600 mb-6">Sua contribuição para a segurança foi registrada. Agradecemos seu compromisso.</p>
        
        <div className="bg-gray-50 rounded-md p-4 text-left space-y-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Resumo do Envio</h2>
          <div>
            <p className="text-sm font-medium text-gray-500">Código do Relato</p>
            <p className="text-lg font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">{relatoId}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Descrição</p>
            <p className="text-gray-800 truncate">{relatoData.descricao}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Local</p>
            <p className="text-gray-800">{relatoData.local_ocorrencia}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Data da Ocorrência</p>
            <p className="text-gray-800">{new Date(relatoData.data_ocorrencia).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <Button asChild>
            <Link to="/relatos">Ver todos os Relatos</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/relatos/new">Criar novo Relato</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RelatoConfirmationPage;
