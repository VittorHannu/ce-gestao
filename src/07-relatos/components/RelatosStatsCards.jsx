/*
 * Este componente React (`RelatosStatsCards`) exibe cartões de estatísticas
 * para os relatos de segurança, mostrando o total de relatos, concluídos,
 * em andamento e sem tratativa. Cada cartão é clicável e navega para a lista
 * de relatos correspondente.
 *
 * Visualmente no seu site, você o vê como um conjunto de caixas informativas
 * que resumem o estado geral dos relatos. Cada caixa mostra um número e um ícone,
 * e ao clicar nela, você é levado para uma página com mais detalhes sobre aquela categoria de relatos.
 *
 *
 *
 *
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, FileText } from 'lucide-react';

const RelatosStatsCards = ({ stats }) => {
  if (!stats) {
    return null; // Ou um componente de placeholder/loading se preferir
  }
  const navigate = useNavigate();

  const statsConfig = [
    {
      key: 'total_relatos',
      label: 'Total de Relatos',
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      path: '/relatos/todos'
    },
    {
      key: 'relatos_concluidos',
      label: 'Concluídos',
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      path: '/relatos/status/concluido'
    },
    {
      key: 'relatos_em_andamento',
      label: 'Em Andamento',
      icon: Clock,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      path: '/relatos/status/em_andamento'
    },
    {
      key: 'relatos_sem_tratativa',
      label: 'Sem Tratativa',
      icon: XCircle,
      color: 'bg-red-800',
      textColor: 'text-red-800',
      path: '/relatos/status/sem_tratativa'
    }
  ];

  const handleCardClick = (path) => {
    console.log('[RelatosStatsCards] Card clicado! Navegando para:', path);
    navigate(path);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {statsConfig.map(({ key, label, icon: Icon, color, textColor, path }) => (
        <div 
          key={key} 
          className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-xl transition-shadow duration-300"
          onClick={() => handleCardClick(path)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
              <p className={`text-xl font-bold ${textColor} flex items-center gap-2`}>
                <Icon className="w-5 h-5" /> {stats[key] || 0}
              </p>
            </div>
            
          </div>
          
          {stats.total_relatos > 0 && key !== 'total_relatos' && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${color}`}
                  style={{
                    width: `${((stats[key] || 0) / stats.total_relatos) * 100}%`
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.total_relatos > 0 ? Math.round(((stats[key] || 0) / stats.total_relatos) * 100) : 0}% do total
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RelatosStatsCards;

