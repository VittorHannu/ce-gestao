
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/01-shared/components/ui/card';
import { Calendar, MapPin, User, Image, MessageSquare } from 'lucide-react';

const statusConfig = {
  CONCLUIDO: { text: 'Concluído', color: 'bg-green-500' },
  EM_ANDAMENTO: { text: 'Em Andamento', color: 'bg-orange-500' },
  SEM_TRATATIVA: { text: 'Sem Tratativa', color: 'bg-red-500' },
  PENDENTE: { text: 'Pendente', color: 'bg-yellow-500' },
  APROVADO: { text: 'Aprovado', color: 'bg-blue-500' },
  REPROVADO: { text: 'Reprovado', color: 'bg-gray-500' },
};

const getTreatmentStatus = (relato) => {
    if (relato.data_conclusao_solucao || relato.concluido_sem_data) return 'CONCLUIDO';
    if (relato.planejamento_cronologia_solucao) return 'EM_ANDAMENTO';
    return 'SEM_TRATATIVA';
}

const DynamicRelatoCard = ({ relato, viewOptions, disableLink }) => {
  const location = useLocation();

  // Determine status: use treatment status for approved reports, otherwise use the report's own status
  const finalStatusKey = relato.status === 'APROVADO' ? getTreatmentStatus(relato) : relato.status;
  const { text: statusText, color: statusColor } = statusConfig[finalStatusKey] || { text: 'Indefinido', color: 'bg-gray-400' };

  const cardContent = (
    <Card className="w-full bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${statusColor}`}></span>
          <span className="text-sm font-semibold text-gray-600">{statusText}</span>
        </div>
        <h2 className="text-lg font-bold text-gray-800 mt-2">{relato.relato_code}</h2>
      </CardHeader>

      <CardContent className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{new Date(relato.data_ocorrencia).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{relato.local_ocorrencia}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>{relato.is_anonymous ? 'Anônimo' : relato.user_full_name || 'Usuário desconhecido'}</span>
        </div>

        {(viewOptions.showDescription || viewOptions.showRisks || viewOptions.showSolution || viewOptions.showDamage) && (
            <div className="border-t border-gray-200 pt-3 mt-3 space-y-3">
                {viewOptions.showDescription && (
                    <div>
                        <h4 className="font-bold text-gray-700">Descrição do Evento</h4>
                        <p className="text-gray-600 text-sm mt-1">{relato.descricao}</p>
                    </div>
                )}
                {viewOptions.showRisks && (
                    <div>
                        <h4 className="font-bold text-gray-700">Riscos Identificados</h4>
                        <p className="text-gray-600 text-sm mt-1">{relato.riscos_identificados}</p>
                    </div>
                )}
                {viewOptions.showSolution && relato.planejamento_cronologia_solucao && (
                    <div>
                        <h4 className="font-bold text-gray-700">Solução Implementada</h4>
                        <p className="text-gray-600 text-sm mt-1">{relato.planejamento_cronologia_solucao}</p>
                    </div>
                )}
                 {viewOptions.showDamage && relato.danos_ocorridos && (
                    <div>
                        <h4 className="font-bold text-gray-700">Danos Ocorridos</h4>
                        <p className="text-gray-600 text-sm mt-1">{relato.danos_ocorridos}</p>
                    </div>
                )}
            </div>
        )}

        <div className="border-t border-gray-200 pt-4 flex items-center justify-start gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
                <Image className="h-4 w-4" />
                <span>{relato.image_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{relato.comment_count || 0}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );

  return disableLink ? (
    <div>{cardContent}</div>
  ) : (
    <Link to={`/relatos/detalhes/${relato.id}`} state={{ from: location }} className="block">{cardContent}</Link>
  );
};

export default DynamicRelatoCard;
