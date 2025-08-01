import React from 'react';
import { Calendar, AlertTriangle, User, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card } from '@/core/components/ui/card';

const RelatoCard = ({ relato, onClick }) => {
  const getStatusInfo = (status) => {
    switch (status) {
    case 'Sem Tratativa':
      return { bgColor: 'bg-gray-500', textColor: 'text-white', icon: XCircle };
    case 'Em Andamento':
      return { bgColor: 'bg-orange-500', textColor: 'text-white', icon: Clock };
    case 'Concluído':
      return { bgColor: 'bg-green-500', textColor: 'text-white', icon: CheckCircle };
    default:
      return { bgColor: 'bg-gray-500', textColor: 'text-white', icon: XCircle };
    }
  };

  const getGravidadeColor = (gravidade) => {
    switch (gravidade) {
    case 'Baixa':
      return 'text-green-600';
    case 'Média':
      return 'text-yellow-600';
    case 'Alta':
      return 'text-orange-600';
    case 'Crítica':
      return 'text-red-600';
    default:
      return 'text-gray-600';
    }
  };

  const formatDateOnly = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const { bgColor: statusBgColor, textColor: statusTextColor, icon: StatusIcon } = getStatusInfo(relato.calculated_status);

  return (
    <Card
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-xl transition-shadow duration-300"
      onClick={() => onClick(relato)}
    >
      <div className="flex justify-between items-center mb-3">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusBgColor} ${statusTextColor}`}>
          {StatusIcon && <StatusIcon className="w-4 h-4" />}
          <span className="text-sm font-medium">{relato.calculated_status}</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertTriangle className={`w-4 h-4 ${getGravidadeColor(relato.gravidade)}`} />
          <span className={`text-sm font-medium ${getGravidadeColor(relato.gravidade)}`}>{relato.gravidade}</span>
        </div>
      </div>

      {relato.codigo_relato && (
        <p className="text-xs text-gray-500 mb-2">Código: {relato.codigo_relato}</p>
      )}

      <p className="text-gray-800 text-base font-semibold line-clamp-3 mb-3">
        {relato.descricao}
      </p>

      <div className="flex flex-col gap-1 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{formatDateOnly(relato.data_ocorrencia)}</span>
          {relato.hora_aproximada_ocorrencia && (
            <span className="ml-1">às {relato.hora_aproximada_ocorrencia}</span>
          )}
        </div>

        {relato.tipo_incidente && (
          <div className="flex items-center gap-2">
            <span>Tipo: {relato.tipo_incidente}</span>
          </div>
        )}

        {relato.responsaveis && relato.responsaveis.length > 0 && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Responsáveis: {relato.responsaveis.join(', ')}</span>
          </div>
        )}

        {relato.data_conclusao_solucao && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Concluído em: {formatDateOnly(relato.data_conclusao_solucao)}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RelatoCard;