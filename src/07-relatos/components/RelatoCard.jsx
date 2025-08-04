import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/core/components/ui/card';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'; // Importa os ícones

const RelatoCard = ({ relato, disableLink }) => {
  const getTreatmentStatusDisplay = () => {
    if (relato.data_conclusao_solucao) {
      return { text: 'Concluído', icon: CheckCircle, color: 'text-green-600' };
    } else if (relato.planejamento_cronologia_solucao) {
      return { text: 'Em Andamento', icon: Clock, color: 'text-orange-600' };
    } else {
      return { text: 'Sem Tratativa', icon: AlertCircle, color: 'text-red-600' };
    }
  };

  const { text: statusText, icon: StatusIcon, color: statusColor } = getTreatmentStatusDisplay();

  const cardContent = (
    <Card className="hover:shadow-lg transition-shadow duration-200 p-3">
      <CardHeader className="p-0">
        <CardTitle className="text-lg font-semibold mb-1">{relato.relato_code}</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Data: {new Date(relato.data_ocorrencia).toLocaleDateString()}
          {relato.hora_aproximada_ocorrencia && ` - ${relato.hora_aproximada_ocorrencia}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-base text-gray-700 line-clamp-3 mb-4">{relato.descricao}</p>
        {relato.data_conclusao_solucao && (
          <p className="text-sm text-gray-600 mt-1">Concluído em: {new Date(relato.data_conclusao_solucao).toLocaleDateString()}</p>
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
