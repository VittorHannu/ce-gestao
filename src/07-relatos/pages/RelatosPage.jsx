import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/core/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/core/components/ui/card';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import { useRelatoCounts } from '../hooks/useRelatoCounts'; // Importa o novo hook
import LoadingSpinner from '@/01-common/components/LoadingSpinner'; // Importa o LoadingSpinner

const RelatosPage = () => {
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();
  const { data: relatoCounts, isLoading: isLoadingCounts } = useRelatoCounts();

  if (isLoadingProfile || isLoadingCounts) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-end items-center mb-6">
        <div className="flex space-x-2">
          {!isLoadingProfile && userProfile?.can_manage_relatos && (
            <Link to="/relatos/aprovacao">
              <Button variant="secondary">Aprovar Relatos</Button>
            </Link>
          )}
          <Link to="/relatos/novo">
            <Button>Criar Novo Relato</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Todos os Relatos Aprovados */}
        <Link to="/relatos/lista?status=aprovado" className="block">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Todos os Relatos Aprovados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{relatoCounts?.totalAprovados || 0}</p>
              <p className="text-sm text-gray-500">Relatos aprovados no total</p>
            </CardContent>
          </Card>
        </Link>

        {/* Card: Relatos Concluídos */}
        <Link to="/relatos/lista?status=concluido" className="block">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Relatos Concluídos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{relatoCounts?.concluidos || 0}</p>
              <p className="text-sm text-gray-500">Relatos com tratativa finalizada</p>
            </CardContent>
          </Card>
        </Link>

        {/* Card: Relatos Em Andamento */}
        <Link to="/relatos/lista?status=em_andamento" className="block">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Relatos Em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{relatoCounts?.emAndamento || 0}</p>
              <p className="text-sm text-gray-500">Relatos com tratativa em curso</p>
            </CardContent>
          </Card>
        </Link>

        {/* Card: Relatos Sem Tratativa */}
        <Link to="/relatos/lista?status=sem_tratativa" className="block">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Relatos Sem Tratativa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{relatoCounts?.semTratativa || 0}</p>
              <p className="text-sm text-gray-500">Relatos aprovados aguardando ação</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default RelatosPage;

