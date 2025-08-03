import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/core/components/ui/button';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import { useRelatoCounts } from '../hooks/useRelatoCounts';
import LoadingSpinner from '@/01-common/components/LoadingSpinner';
import { FileText, CheckCircle, Clock, XCircle, BarChart } from 'lucide-react';
import RelatoStatsCard from '../components/RelatoStatsCard'; // Importa o novo componente de card

const RelatosPage = () => {
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();
  const { data: relatoCounts, isLoading: isLoadingCounts } = useRelatoCounts();

  if (isLoadingProfile || isLoadingCounts) {
    return <LoadingSpinner />;
  }

  const cardData = [
    {
      label: 'Todos',
      count: relatoCounts?.totalAprovados || 0,
      icon: FileText,
      path: '/relatos/lista?status=aprovado',
      textColorClass: 'text-blue-600',
      bgColorClass: 'bg-blue-600'
    },
    {
      label: 'Concluídos',
      count: relatoCounts?.concluidos || 0,
      icon: CheckCircle,
      path: '/relatos/lista?status=concluido',
      textColorClass: 'text-green-600',
      bgColorClass: 'bg-green-600'
    },
    {
      label: 'Em Andamento',
      count: relatoCounts?.emAndamento || 0,
      icon: Clock,
      path: '/relatos/lista?status=em_andamento',
      textColorClass: 'text-orange-600',
      bgColorClass: 'bg-orange-600'
    },
    {
      label: 'Sem Tratativa',
      count: relatoCounts?.semTratativa || 0,
      icon: XCircle,
      path: '/relatos/lista?status=sem_tratativa',
      textColorClass: 'text-red-600',
      bgColorClass: 'bg-red-600'
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-2 gap-4">
        {cardData.map((card, index) => (
          <RelatoStatsCard
            key={index}
            label={card.label}
            count={card.count}
            icon={card.icon}
            path={card.path}
            textColorClass={card.textColorClass}
            bgColorClass={card.bgColorClass}
            totalRelatos={relatoCounts?.totalAprovados || 0} // Passa o total para o cálculo da porcentagem
          />
        ))}
      </div>

      <div className="h-0.5 w-full bg-gray-300 rounded-full my-10"></div>

      <div className="flex flex-col items-center mt-6 space-y-4">
        {!isLoadingProfile && userProfile?.can_manage_relatos && (
          <Link to="/relatos/aprovacao" className="w-full">
            <Button variant="default" size="lg" className="w-full flex items-center justify-center space-x-2">
              <span>Aprovar Relatos</span>
              {relatoCounts?.pendenteAprovacao > 0 && (
                <span className="ml-2 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                  {relatoCounts.pendenteAprovacao}
                </span>
              )}
            </Button>
          </Link>
        )}
        <Link to="/relatos/novo" className="w-full">
          <Button size="lg" className="w-full">Criar Novo Relato</Button>
        </Link>
      </div>

      <div className="h-0.5 w-full bg-gray-300 rounded-full my-10"></div>

      <div className="bg-yellow-500 p-6 rounded-lg shadow-md text-center flex flex-col items-center justify-center">
        <BarChart className="h-12 w-12 text-white mb-4" />
        <h2 className="text-xl font-semibold text-white">Gráficos e Estatísticas</h2>
      </div>
    </div>
  );
};

export default RelatosPage;

