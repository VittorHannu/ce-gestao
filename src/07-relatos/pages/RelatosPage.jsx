import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/01-shared/components/ui/button';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import { useRelatoCounts } from '../hooks/useRelatoCounts';

import { CheckCircle, Clock, XCircle, BarChart, Plus, User, AlertTriangle, List, Bell, Settings } from 'lucide-react';

import RelatoStatsCard from '../components/RelatoStatsCard';
import TotalReportsCard from '../components/TotalReportsCard';
import RelatoStatsCardSkeleton from '../components/RelatoStatsCardSkeleton';
import TotalReportsCardSkeleton from '../components/TotalReportsCardSkeleton';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import MainLayout from '@/01-shared/components/MainLayout';
import SettingsGroup from '@/01-shared/components/settings/SettingsGroup';
import SettingsItem from '@/01-shared/components/settings/SettingsItem';
import CompactDateSelector from '@/01-shared/components/CompactDateSelector';

const RelatosPage = () => {
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();
  const { data: relatoCounts, isLoading: isLoadingCounts, isFetching } = useRelatoCounts();

  const cardData = [
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
        <CompactDateSelector>
          <div className="flex items-center space-x-2">
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
        </CompactDateSelector>
      )}
    >
      <div className="space-y-8" style={{ marginTop: '1.75rem' }}>
        {isLoadingCounts || isLoadingProfile ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {isFetching ? (
                <>
                  <div className="col-span-2">
                    <TotalReportsCardSkeleton />
                  </div>
                  <RelatoStatsCardSkeleton />
                  <RelatoStatsCardSkeleton />
                  <RelatoStatsCardSkeleton />
                  <RelatoStatsCardSkeleton />
                </>
              ) : (
                cardData.map((card, index) => (
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
                ))
              )}
            </div>

            <div>
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

            <Link to="/relatos/estatisticas" className="w-full block">
              <div className="bg-yellow-500 p-6 rounded-lg shadow-none text-center flex flex-col items-center justify-center">
                <BarChart className="h-12 w-12 text-white mb-4" />
                <h2 className="text-xl font-semibold text-white">Gráficos e Estatísticas</h2>
              </div>
            </Link>
          </>
        )}
      </div>
      <Link to="/relatos/novo" className="fixed bottom-12 right-4 z-50">
        <Button variant="warning" size="icon" className="rounded-full w-14 h-14 shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </MainLayout>
  );
};

export default RelatosPage;