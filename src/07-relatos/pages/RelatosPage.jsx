import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/01-shared/components/ui/button';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import { useRelatoCounts } from '../hooks/useRelatoCounts';

import { CheckCircle, Clock, XCircle, BarChart, Plus, User, AlertTriangle, List, Bell, Settings } from 'lucide-react';
import RelatoStatsCard from '../components/RelatoStatsCard';
import TotalReportsCard from '../components/TotalReportsCard';
import DateFilterCard from '../components/DateFilterCard';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import MainLayout from '@/01-shared/components/MainLayout';
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
      label: 'Filtrar por Período',
      component: <DateFilterCard />,
      isLink: false
    },
    {
      label: 'Total de Relatos',
      component: <TotalReportsCard totalReports={relatoCounts?.totalAprovados || 0} />,
      path: '/relatos/lista',
      isLink: true
    },
    {
      label: 'Concluídos',
      count: relatoCounts?.concluidos || 0,
      icon: CheckCircle,
      path: '/relatos/lista?status=concluido',
      iconTextColor: 'text-green-700',
      iconBgColor: 'bg-green-100',
      progressBarColor: 'bg-green-500',
      isLink: true
    },
    {
      label: 'Em Andamento',
      count: relatoCounts?.emAndamento || 0,
      icon: Clock,
      path: '/relatos/lista?status=em_andamento',
      iconTextColor: 'text-amber-700',
      iconBgColor: 'bg-amber-100',
      progressBarColor: 'bg-amber-500',
      isLink: true
    },
    {
      label: 'Sem Tratativa',
      count: relatoCounts?.semTratativa || 0,
      icon: XCircle,
      path: '/relatos/lista?status=sem_tratativa',
      iconTextColor: 'text-rose-700',
      iconBgColor: 'bg-rose-100',
      progressBarColor: 'bg-rose-500',
      isLink: true
    }
  ];

  const managementItems = [
    {
      label: 'Lista Total de Relatos',
      value: relatoCounts?.totalAprovados || 0,
      icon: List,
      iconColor: 'bg-gray-500',
      path: '/relatos/lista',
      show: true
    },
    {
      label: 'Relatos que você fez',
      value: relatoCounts?.myRelatosCount || 0,
      icon: List,
      iconColor: 'bg-blue-500',
      path: '/relatos/lista?only_mine=true',
      show: true
    },
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
    <MainLayout
      header={(
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-bold">Relatos</h1>
          <div className="flex items-center">
            <Link to="/notifications">
              <Button variant="ghost" size="icon">
                <Bell className="h-6 w-6" />
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    >
      <div className="grid grid-cols-2 gap-4">
        {cardData.map((card, index) => (
          card.component ? (
            card.isLink ? (
              <Link to={card.path} key={index} className="w-full block">
                {card.component}
              </Link>
            ) : (
              <div key={index} className={`w-full block ${index === 0 ? 'col-span-2' : ''}`}>
                {card.component}
              </div>
            )
          ) : (
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
          )
        ))}
      </div>

      <div className="mt-8">
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

      <Link to="/relatos/estatisticas" className="w-full block mt-8">
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

