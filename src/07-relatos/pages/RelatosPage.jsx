import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/01-shared/components/ui/button';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import { useRelatoCounts } from '../hooks/useRelatoCounts';


import { FileText, CheckCircle, Clock, XCircle, BarChart, Plus, User } from 'lucide-react'; // Added Tag icon
import RelatoStatsCard from '../components/RelatoStatsCard';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import MainLayout from '@/01-shared/components/MainLayout';
import DateFilter from '@/01-shared/components/DateFilter'; // Importa o novo componente de card
import PendingReportsButton from '../components/PendingReportsButton';

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
      bgColorClass: 'bg-blue-600',
      showPercentage: false
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
    <MainLayout>
      <div className="grid grid-cols-2 gap-4">
        <DateFilter />
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
            showPercentage={card.showPercentage}
          >
            {card.label === 'Todos' && !isLoadingProfile && userProfile?.can_manage_relatos && (
              <PendingReportsButton
                count={relatoCounts?.pendenteAprovacao}
                className="text-red-600"
              />
            )}
          </RelatoStatsCard>
        ))}
      </div>

      <div className="flex flex-col items-center mt-12 space-y-4">
        <Link to="/relatos/atribuidos" className="w-full">
          <Button variant="default" size="lg" className="w-full flex items-center justify-center space-x-2 shadow-none">
            <User className="h-5 w-5" />
            <span>Relatos Atribuídos a Você</span>
            {relatoCounts?.relatosAtribuidos > 0 && (
              <span className="ml-2 px-2 py-1 text-xs font-bold text-white bg-blue-500 rounded-full">
                {relatoCounts.relatosAtribuidos}
              </span>
            )}
          </Button>
        </Link>
      </div>

      <Link to="/relatos/estatisticas" className="w-full block mt-12">
        <div className="bg-yellow-500 p-6 rounded-lg shadow-none text-center flex flex-col items-center justify-center">
          <BarChart className="h-12 w-12 text-white mb-4" />
          <h2 className="text-xl font-semibold text-white">Gráficos e Estatísticas</h2>
        </div>
      </Link>
      <Link to="/relatos/novo">
        <Button
          variant="warning"
          className="fixed right-4 rounded-full shadow-lg h-12 px-6 flex items-center justify-center"
          style={{ bottom: 'calc(60px + env(safe-area-inset-bottom) + 16px)' }}
        >
          <Plus className="h-6 w-6 mr-2" />
          <span>Novo Relato</span>
        </Button>
      </Link>
    </MainLayout>
  );
};

export default RelatosPage;

