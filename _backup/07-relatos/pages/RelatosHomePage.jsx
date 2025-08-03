import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import MainLayout from '@/01-common/components/MainLayout';
import { Button } from '@/core/components/ui/button';
import { Plus } from 'lucide-react';

import RelatosStatsCards from '@/07-relatos/components/RelatosStatsCards';
import { useRelatosStats } from '@/07-relatos/hooks/useRelatosStats';
import LoadingSpinner from '@/01-common/components/LoadingSpinner';

const RelatosHomePage = () => {
  const navigate = useNavigate();
  const { user } = useOutletContext();

  const { stats, statsLoading, statsError } = useRelatosStats(user);

  const handleCreateRelato = () => {
    navigate('/relatos/novo');
  };

  if (statsLoading) {
    return (
      <MainLayout title="Carregando...">
        <LoadingSpinner message="Carregando estatísticas..." />
      </MainLayout>
    );
  }

  if (statsError) {
    return (
      <MainLayout title="Erro">
        <div className="text-center py-10">
          <p className="text-lg text-red-500">Erro ao carregar as estatísticas: {statsError.message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Relatos de Segurança">
      <div className="mb-12">
        <RelatosStatsCards stats={stats} />
      </div>
      <div className="flex justify-center gap-4">
        <Button onClick={handleCreateRelato} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Criar Novo Relato
        </Button>
      </div>
    </MainLayout>
  );
};

export default RelatosHomePage;
