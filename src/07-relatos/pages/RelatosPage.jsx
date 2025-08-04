import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/core/components/ui/button';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import { useRelatoCounts } from '../hooks/useRelatoCounts';
import LoadingSpinner from '@/01-common/components/LoadingSpinner';
import MainLayout from '@/01-common/components/MainLayout';
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
    <MainLayout title="Segurança Laboral">
      <h1 className="text-2xl font-bold mb-8">Segurança Laboral</h1>
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

      <div className="flex flex-col items-center mt-12 space-y-4">
        {!isLoadingProfile && userProfile?.can_manage_relatos && (
          <Link to="/relatos/aprovacao" className="w-full">
            <Button variant="default" size="lg" className="w-full flex items-center justify-center space-x-2 shadow-none">
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
          <Button size="lg" className="w-full shadow-none">Criar Novo Relato</Button>
        </Link>
        <Link to="/relatos/atribuidos" className="w-full">
          <Button variant="default" size="lg" className="w-full flex items-center justify-center space-x-2 shadow-none">
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
    </MainLayout>
  );
};

export default RelatosPage;

