import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/core/components/ui/card';

const RelatoCard = ({ relato }) => {
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
          <p className="text-sm text-gray-600 mt-2">
            Status da Tratativa: {
              relato.data_conclusao_solucao
                ? 'Concluído'
                : relato.planejamento_cronologia_solucao
                ? 'Em Andamento'
                : 'Sem Tratativa'
            }
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default RelatoCard;
