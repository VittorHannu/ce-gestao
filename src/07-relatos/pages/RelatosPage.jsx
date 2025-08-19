import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/01-shared/components/ui/button';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import { useRelatoCounts } from '../hooks/useRelatoCounts';

import { FileText, CheckCircle, Clock, XCircle, BarChart, Plus, User, AlertTriangle } from 'lucide-react';
import RelatoStatsCard from '../components/RelatoStatsCard';
import TotalReportsCard from '../components/TotalReportsCard';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import MainLayout from '@/01-shared/components/MainLayout';
import DateFilter from '@/01-shared/components/DateFilter';
import SettingsGroup from '@/01-shared/components/settings/SettingsGroup';
import SettingsItem from '@/01-shared/components/settings/SettingsItem';

const RelatosPage = () => {
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();
  const { data: relatoCounts, isLoading: isLoadingCounts } = useRelatoCounts();

  if (isLoadingProfile || isLoadingCounts) {
    return <LoadingSpinner />;
  }

  const cardData = [
    {
      label: 'Concluídos',
      count: relatoCounts?.concluidos || 0,
      icon: CheckCircle,
      path: '/relatos/lista?status=concluido',
      iconTextColor: 'text-green-700',
      iconBgColor: 'bg-green-100',
      progressBarColor: 'bg-green-500'
    },
    {
      label: 'Em Andamento',
      count: relatoCounts?.emAndamento || 0,
      icon: Clock,
      path: '/relatos/lista?status=em_andamento',
      iconTextColor: 'text-amber-700',
      iconBgColor: 'bg-amber-100',
      progressBarColor: 'bg-amber-500'
    },
    {
      label: 'Sem Tratativa',
      count: relatoCounts?.semTratativa || 0,
      icon: XCircle,
      path: '/relatos/lista?status=sem_tratativa',
      iconTextColor: 'text-rose-700',
      iconBgColor: 'bg-rose-100',
      progressBarColor: 'bg-rose-500'
    }
  ];

  const managementItems = [
    {
      label: 'Pendentes',
      value: relatoCounts?.pendenteAprovacao || 0,
      icon: AlertTriangle,
      iconColor: 'bg-red-500',
      path: '/relatos/aprovacao',
      show: !isLoadingProfile && userProfile?.can_manage_relatos
    },
    {
      label: 'Atribuídos a Você',
      value: relatoCounts?.relatosAtribuidos || 0,
      icon: User,
      iconColor: 'bg-purple-500',
      path: '/relatos/atribuidos',
      show: true
    }
  ];

  return (
    <MainLayout>
      <div className="grid grid-cols-2 gap-4">
        <TotalReportsCard totalReports={relatoCounts?.totalAprovados || 0} />
        {cardData.map((card, index) => (
          <RelatoStatsCard
            key={index}
            label={card.label}
            count={card.count}
            icon={card.icon}
            path={card.path}
            iconTextColor={card.iconTextColor}
            iconBgColor={card.iconBgColor}
            progressBarColor={card.progressBarColor}
            totalRelatos={relatoCounts?.totalAprovados || 0}
          />
        ))}
      </div>

      <div className="mt-6">
        <SettingsGroup>
          {managementItems.filter(item => item.show).map((item, index) => (
            <SettingsItem
              key={index}
              label={item.label}
              value={item.value}
              icon={item.icon}
              iconColor={item.iconColor}
              path={item.path}
            />
          ))}
        </SettingsGroup>
      </div>

      <Link to="/relatos/estatisticas" className="w-full block mt-6">
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

