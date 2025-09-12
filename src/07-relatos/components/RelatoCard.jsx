import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/01-shared/components/ui/card';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'; // Importa os ícones

const RelatoCard = ({ relato, disableLink }) => {
  const getTreatmentStatusDisplay = () => {
    if (relato.data_conclusao_solucao || relato.concluido_sem_data) {
      return { text: 'Concluído', icon: CheckCircle, color: 'text-white', bgColor: 'bg-green-600' };
    } else if (relato.planejamento_cronologia_solucao) {
      return { text: 'Em Andamento', icon: Clock, color: 'text-white', bgColor: 'bg-orange-600' };
    } else {
      return { text: 'Sem Tratativa', icon: AlertCircle, color: 'text-white', bgColor: 'bg-red-600' };
    }
  };

  const { text: statusText, icon: StatusIcon, color: statusColor, bgColor } = getTreatmentStatusDisplay();

  const cardContent = (
    <Card className={`transition-shadow duration-200 p-3 ${bgColor} w-full min-w-0`} style={{ boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)' }}>
      <CardHeader className="p-0">
        <CardTitle className="text-lg font-semibold mb-1 text-white">{relato.relato_code}</CardTitle>
        <CardDescription className="text-sm text-gray-200">
          Data da Ocorrência: {new Date(relato.data_ocorrencia).toLocaleDateString()}
          {relato.hora_aproximada_ocorrencia && ` - ${relato.hora_aproximada_ocorrencia}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-base text-gray-100 mb-4">{relato.descricao}</p>
        {relato.data_conclusao_solucao && (
          <p className="text-sm text-gray-200 mt-1">Concluído em: {new Date(relato.data_conclusao_solucao).toLocaleDateString()}</p>
        )}
        <div className="flex items-center mt-2">
          <StatusIcon className={`h-4 w-4 mr-2 ${statusColor}`} />
          <p className={`text-sm font-medium ${statusColor}`}>{statusText}</p>
        </div>
      </CardContent>
    </Card>
  );

  return disableLink ? (
    <div className="block">{cardContent}</div>
  ) : (
    <Link to={`/relatos/detalhes/${relato.id}`} className="block">{cardContent}</Link>
  );
};

export default RelatoCard;
