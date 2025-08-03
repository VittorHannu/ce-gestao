import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/core/components/ui/card';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'; // Importa os ícones

const RelatoCard = ({ relato }) => {
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

  return (
    <Link to={`/relatos/detalhes/${relato.id}`} className="block">
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle>{relato.local_ocorrencia}</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Data: {new Date(relato.data_ocorrencia).toLocaleDateString()}
            {relato.hora_aproximada_ocorrencia && ` - ${relato.hora_aproximada_ocorrencia}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mt-2 text-gray-700 line-clamp-3">{relato.descricao}</p>
          {relato.riscos_identificados && (
            <p className="text-sm text-gray-600 mt-2">Riscos: {relato.riscos_identificados}</p>
          )}
          {relato.danos_ocorridos && (
            <p className="text-sm text-gray-600">Danos: {relato.danos_ocorridos}</p>
          )}
          {relato.planejamento_cronologia_solucao && (
            <p className="text-sm text-gray-600 mt-2">Planejamento: {relato.planejamento_cronologia_solucao}</p>
          )}
          {relato.data_conclusao_solucao && (
            <p className="text-sm text-gray-600">Concluído em: {new Date(relato.data_conclusao_solucao).toLocaleDateString()}</p>
          )}
          <div className="flex items-center mt-2">
            <StatusIcon className={`h-4 w-4 mr-2 ${statusColor}`} />
            <p className={`text-sm font-medium ${statusColor}`}>{statusText}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default RelatoCard;
