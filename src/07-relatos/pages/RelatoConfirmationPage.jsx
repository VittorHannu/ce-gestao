import React, { useRef } from 'react';
import { useLocation, Link, useOutletContext } from 'react-router-dom';
import { CheckCircleIcon, ArrowLeftIcon, PrinterIcon } from '@heroicons/react/24/solid';
import { Button } from '@/01-shared/components/ui/button';
import MainLayout from '@/01-shared/components/MainLayout';

const ConfirmationField = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-gray-800 break-words">{value || 'Não informado'}</p>
  </div>
);

const RelatoConfirmationPage = () => {
  const location = useLocation();
  const context = useOutletContext();
  const submissionData = location.state?.submissionData;
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  if (!submissionData || !submissionData.relatoData) {
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

  const { relatoCode, relatoData, imageUrls, submissionTimestamp } = submissionData;
  const isReportAnonymous = relatoData.is_anonymous;
  const isAuthenticated = !!context?.user;
  const backUrl = isAuthenticated ? '/' : '/auth';

  const pageContent = (
    // Add print-specific margin and padding removal
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:m-0">
      {/* Add print-specific styles to make it look like a document */}
      <div className="bg-white shadow-lg rounded-lg p-8 print:shadow-none print:border-none print:rounded-none" ref={printRef}>
        {/* This div contains the back button and should be hidden when printing */}
        <div className="absolute top-4 left-4 print:hidden">
          <Button asChild variant="ghost" size="icon">
            <Link to={backUrl}><ArrowLeftIcon className="h-6 w-6" /></Link>
          </Button>
        </div>

        <div className="flex justify-center mb-4">
          <img src="/pwa-192x192.png" alt="Copa Energia Logo" className="h-20 w-20" />
        </div>

        <div className="text-center mb-8">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4 print:hidden" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Relato Enviado com Sucesso!</h1>
          <p className="text-gray-600">Sua contribuição para a segurança foi registrada. Agradecemos seu compromisso.</p>
        </div>
        
        <div className="bg-gray-50 rounded-md p-6 text-left space-y-5 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-3">Resumo do Envio</h2>
          
          <div>
            <p className="text-sm font-bold text-gray-500">CÓDIGO DO RELATO</p>
            <p className="text-xl font-semibold text-gray-800">{relatoCode}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <ConfirmationField label="Descrição da Ocorrência" value={relatoData.descricao} />
            <ConfirmationField label="Riscos Identificados" value={relatoData.riscos_identificados} />
            <ConfirmationField label="Danos Ocorridos" value={relatoData.danos_ocorridos} />
            <ConfirmationField label="Local da Ocorrência" value={relatoData.local_ocorrencia} />
            <ConfirmationField label="Data da Ocorrência" value={new Date(relatoData.data_ocorrencia).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} />
            <ConfirmationField label="Hora Aproximada" value={relatoData.hora_aproximada_ocorrencia} />
            <ConfirmationField label="Relato Anônimo" value={isReportAnonymous ? 'Sim' : 'Não'} />
            {submissionTimestamp && (
              <ConfirmationField label="Data de Envio" value={new Date(submissionTimestamp).toLocaleString('pt-BR')} />
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 mt-4">Imagens Enviadas</p>
            {imageUrls && imageUrls.length > 0 ? (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`Imagem enviada ${index + 1}`} className="h-32 w-full object-cover" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-800">Nenhuma imagem foi enviada.</p>
            )}
          </div>
        </div>
      </div>

      {/* This entire div of buttons will be hidden when printing */}
      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 print:hidden">
        <Button onClick={handlePrint} variant="outline" size="lg">
          <PrinterIcon className="h-5 w-5 mr-2" />
            Imprimir
        </Button>
        <Button asChild size="lg" className="mt-4 sm:mt-0">
          <Link to="/relatos/novo">Criar novo Relato</Link>
        </Button>
      </div>
    </div>
  );

  if (isAuthenticated) {
    return <MainLayout _user={context.user}>{pageContent}</MainLayout>;
  } else {
    // Bypassing PublicLayout as it was causing a blank screen.
    // A simple div wrapper is sufficient for the anonymous confirmation page.
    return <div className="bg-gray-50 min-h-screen">{pageContent}</div>;
  }
};

export default RelatoConfirmationPage;
