
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { Button } from '@/01-shared/components/ui/button';

const ConfirmationField = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-gray-800">{value || 'Não informado'}</p>
  </div>
);

const RelatoConfirmationPage = () => {
  const location = useLocation();
  const { submissionData } = location.state || {};

  if (!submissionData) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">Nenhuma informação de relato encontrada.</h1>
        <p>Parece que você acessou esta página diretamente.</p>
        <Button asChild className="mt-4">
          <Link to="/relatos/novo">Criar novo Relato</Link>
        </Button>
      </div>
    );
  }

  const { relatoCode, relatoData, imageUrls } = submissionData;
  const isAnonymousUser = relatoData.is_anonymous;
  const backUrl = isAnonymousUser ? '/auth' : '/';

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="relative bg-white shadow-lg rounded-lg p-8">
        <div className="absolute top-4 left-4">
          <Button asChild variant="ghost" size="icon">
            <Link to={backUrl}><ArrowLeftIcon className="h-6 w-6" /></Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Relato Enviado com Sucesso!</h1>
          <p className="text-gray-600">Sua contribuição para a segurança foi registrada. Agradecemos seu compromisso.</p>
        </div>
        
        <div className="bg-gray-50 rounded-md p-6 text-left space-y-5 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-3">Resumo do Envio</h2>
          
          <div>
            <p className="text-sm font-bold text-gray-500">CÓDIGO DO RELATO</p>
            <p className="text-2xl font-mono text-blue-600 bg-blue-50 px-3 py-2 rounded-md inline-block">{relatoCode}</p>
          </div>

          <ConfirmationField label="Descrição da Ocorrência" value={relatoData.descricao} />
          <ConfirmationField label="Riscos Identificados" value={relatoData.riscos_identificados} />
          <ConfirmationField label="Danos Ocorridos" value={relatoData.danos_ocorridos} />
          <ConfirmationField label="Local da Ocorrência" value={relatoData.local_ocorrencia} />
          <ConfirmationField label="Data da Ocorrência" value={new Date(relatoData.data_ocorrencia).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} />
          <ConfirmationField label="Hora Aproximada" value={relatoData.hora_aproximada_ocorrencia} />

          <div>
            <p className="text-sm font-medium text-gray-500">Imagens Enviadas</p>
            {imageUrls && imageUrls.length > 0 ? (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <img src={url} alt={`Imagem enviada ${index + 1}`} className="h-32 w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-800">Nenhuma imagem foi enviada.</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button asChild size="lg">
            <Link to="/relatos/novo">Criar novo Relato</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RelatoConfirmationPage;
