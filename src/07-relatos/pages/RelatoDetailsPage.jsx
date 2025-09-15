import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import { Button } from '@/01-shared/components/ui/button';
import RelatoDisplayDetails from '../components/RelatoDisplayDetails';
import PageHeader from '@/01-shared/components/PageHeader';
import RelatoComments from '../components/RelatoComments';
import MainLayout from '@/01-shared/components/MainLayout';
import { useRelatoManagement } from '../hooks/useRelatoManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/01-shared/components/ui/tabs';
import RelatoLogs from '../components/RelatoLogs';

const RelatoDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    relato,
    currentResponsibles,
    loading,
    error,
    isSaving,
    isDeleting,
    isReproving,
    handleReproveRelato,
    handleReapproveRelato,
    handleDeleteRelato,
    userProfile,
    isLoadingProfile
  } = useRelatoManagement(id);

  const canManageRelatos = userProfile?.can_manage_relatos;
  const canDeleteRelatos = userProfile?.can_delete_relatos;

  const isResponsibleForRelato = currentResponsibles.includes(userProfile?.id);

  if (loading || isLoadingProfile) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error.message || error}</div>;
  }

  if (!relato) {
    return <div className="container mx-auto p-4">Relato não encontrado.</div>;
  }

  return (
    <MainLayout
      header={<PageHeader title="Detalhes do Relato" />}
    >
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="comments">
            Comentários
            {/* TODO: Adicionar lógica para mostrar o badge apenas quando houver comentários novos */}
            <span className="absolute top-1.5 right-4 h-2 w-2 rounded-full bg-red-500" />
          </TabsTrigger>
          <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <RelatoDisplayDetails relato={relato} responsibles={relato.responsibles} />

            <div className="mt-6 flex justify-center">
              {canDeleteRelatos && (
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (window.confirm('Tem certeza que deseja excluir este relato? Esta ação não pode ser desfeita.')) {
                      const success = await handleDeleteRelato();
                      if (success) {
                        navigate('/relatos');
                      }
                    }
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </Button>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comments">
          <RelatoComments relatoId={id} />
        </TabsContent>

        <TabsContent value="logs">
          <RelatoLogs relatoId={id} />
        </TabsContent>

      </Tabs>
    </MainLayout>
  );
};

export default RelatoDetailsPage;
