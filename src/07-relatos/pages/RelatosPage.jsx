import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/01-shared/components/ui/button';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import { useRelatoCounts } from '../hooks/useRelatoCounts';
import { useLastAccidentDate } from '../hooks/useLastAccidentDate';

import { CheckCircle, Clock, XCircle, BarChart, Plus, User, AlertTriangle, List, Bell, Settings } from 'lucide-react';

import RelatoStatsCard from '../components/RelatoStatsCard';
import TotalReportsCard from '../components/TotalReportsCard';
import MainLayout from '@/01-shared/components/MainLayout';
import SettingsGroup from '@/01-shared/components/settings/SettingsGroup';
import SettingsItem from '@/01-shared/components/settings/SettingsItem';
import CompactDateSelector from '@/01-shared/components/CompactDateSelector';
import DaysWithoutAccidentsCard from '../components/DaysWithoutAccidentsCard';

// Componente otimizado para os cards de estatísticas
// Agora ele sempre renderiza os dados, permitindo animações no componente filho.
const StatsGrid = React.memo(({ relatoCounts }) => {
  const cardData = [
    {
      id: 'total',
      component: <TotalReportsCard totalReports={relatoCounts?.totalAprovados || 0} />,
      path: '/relatos/lista',
    },
    {
      id: 'concluidos',
      label: 'Concluídos',
      count: relatoCounts?.concluidos || 0,
      icon: CheckCircle,
      path: '/relatos/lista?status=concluido',
      iconTextColor: 'text-green-700',
      iconBgColor: 'bg-green-100',
      progressBarColor: 'bg-green-500',
    },
    {
      id: 'emAndamento',
      label: 'Em Andamento',
      count: relatoCounts?.emAndamento || 0,
      icon: Clock,
      path: '/relatos/lista?status=em_andamento',
      iconTextColor: 'text-amber-700',
      iconBgColor: 'bg-amber-100',
      progressBarColor: 'bg-amber-500',
    },
    {
      id: 'semTratativa',
      label: 'Sem Tratativa',
      count: relatoCounts?.semTratativa || 0,
      icon: XCircle,
      path: '/relatos/lista?status=sem_tratativa',
      iconTextColor: 'text-rose-700',
      iconBgColor: 'bg-rose-100',
      progressBarColor: 'bg-rose-500',
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {cardData.map((card) => (
        <Link to={card.path} key={card.id} className="w-full block">
          {card.component ? card.component : (
            <RelatoStatsCard
              label={card.label}
              count={card.count}
              icon={card.icon}
              path={card.path}
              iconTextColor={card.iconTextColor}
              iconBgColor={card.iconBgColor}
              progressBarColor={card.progressBarColor}
              totalRelatos={relatoCounts?.totalAprovados || 0}
            />
          )}
        </Link>
      ))}
    </div>
  );
});


const RelatosPage = () => {
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();
  // isFetching foi removido do uso, pois a UI agora atualiza sem piscar
  const { data: relatoCounts } = useRelatoCounts();
  const { data: lastAccidentDate, isLoading: isLoadingLastAccident } = useLastAccidentDate();

  const managementItems = [
    { label: 'Lista Total de Relatos', value: relatoCounts?.totalAprovados || 0, icon: List, iconColor: 'bg-gray-500', path: '/relatos/lista', show: true },
    { label: 'Relatos que você fez', value: relatoCounts?.myRelatosCount || 0, icon: List, iconColor: 'bg-blue-500', path: '/relatos/lista?only_mine=true', show: true },
    { label: 'Pendentes', value: relatoCounts?.pendenteAprovacao || 0, icon: AlertTriangle, iconColor: 'bg-red-500', path: '/relatos/aprovacao', show: !isLoadingProfile && userProfile?.can_manage_relatos },
    { label: 'Atribuídos a Você', value: relatoCounts?.relatosAtribuidos || 0, icon: User, iconColor: 'bg-purple-500', path: '/relatos/atribuidos', show: true }
  ];

  return (
    <MainLayout
      headerClassName="bg-gray-800 border-gray-800"
      header={(
        <CompactDateSelector className="text-white">
          <div className="flex items-center space-x-2">
            <Link to="/notifications"><Button variant="ghost" size="icon"><Bell className="h-6 w-6" /></Button></Link>
            <Link to="/settings"><Button variant="ghost" size="icon"><Settings className="h-6 w-6" /></Button></Link>
          </div>
        </CompactDateSelector>
      )}
    >
      <div className="space-y-8" style={{ marginTop: '1.75rem' }}>
        {/* StatsGrid agora sempre renderiza os dados que tem, sejam novos ou antigos */}
        <StatsGrid relatoCounts={relatoCounts} />

        <div>
          <SettingsGroup>
            {managementItems.filter(item => item.show).map((item, index) => (
              <SettingsItem
                key={index}
                label={item.label}
                // O valor agora simplesmente reflete os dados atuais, sem mostrar '...'
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

        <DaysWithoutAccidentsCard 
          isLoading={isLoadingLastAccident}
          lastAccidentDate={lastAccidentDate}
        />
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
