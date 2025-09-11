import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import { Button } from '@/01-shared/components/ui/button';
import RelatoForm from '../components/RelatoForm'; // Importa o formulário
import RelatoDisplayDetails from '../components/RelatoDisplayDetails'; // Importa o componente de exibição de detalhes
import PageHeader from '@/01-shared/components/PageHeader'; // Importa o PageHeader
import RelatoComments from '../components/RelatoComments';
import MainLayout from '@/01-shared/components/MainLayout';
import { useRelatoManagement } from '../hooks/useRelatoManagement';

const RelatoDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false); // Novo estado para modo de edição

  const {
    relato,
    allUsers,
    currentResponsibles,
    loading,
    error,
    isSaving,
    isDeleting,
    isReproving,
    handleUpdateRelato,
    handleReproveRelato,
    handleReapproveRelato,
    handleDeleteRelato,
    userProfile,
    isLoadingProfile
  } = useRelatoManagement(id);

  const canManageRelatos = userProfile?.can_manage_relatos;
  const canDeleteRelatos = userProfile?.can_delete_relatos;

  const isResponsibleForRelato = currentResponsibles.includes(userProfile?.id);
  const canEditTratativa = canManageRelatos || isResponsibleForRelato;

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
      {isEditing ? (
        <RelatoForm
          onSubmit={async (formData) => {
            const success = await handleUpdateRelato(formData, canManageRelatos);
            if (success) {
              setIsEditing(false); // Exit edit mode
            }
          }}
          isLoading={isSaving}
          initialData={relato} // Passa os dados iniciais para o formulário
          submitButtonText="Salvar Alterações"
          canManageRelatos={canManageRelatos} // Controla a edição de responsáveis
          canEditTratativa={canEditTratativa} // Controla a visibilidade da seção de tratativa
          allUsers={allUsers} // Passa todos os usuários
          initialResponsibles={currentResponsibles} // Passa os responsáveis atuais
        />
      ) : (
        <div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <RelatoDisplayDetails relato={relato} responsibles={relato.responsibles} />

            <div className="mt-6 flex flex-wrap gap-2">
              <>
                {relato.status === 'REPROVADO' && canManageRelatos && !isEditing ? (
                  <Button onClick={handleReapproveRelato} disabled={isSaving}>
                    {isSaving ? 'Reaprovando...' : 'Reaprovar'}
                  </Button>
                ) : (
                  (canManageRelatos || isResponsibleForRelato) && !isEditing && (
                    <>
                      <Button onClick={() => setIsEditing(true)}>Editar</Button>
                      {relato.status !== 'REPROVADO' && canManageRelatos && (
                        <Button
                          variant="warning"
                          onClick={async () => {
                            const success = await handleReproveRelato('Motivo de reprovação');
                            if (success) {
                              navigate('/relatos/reprovados');
                            }
                          }}
                          disabled={isReproving}
                        >
                          {isReproving ? 'Reprovando...' : 'Reprovar'}
                        </Button>
                      )}
                    </>
                  )
                )}
                {canDeleteRelatos && !isEditing && (
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (window.confirm('Tem certeza que deseja excluir este relato? Esta ação não pode ser desfeita.')) {
                        const success = await handleDeleteRelato();
                        if (success) {
                          navigate('/relatos'); // Navigate to the main relatos list after deletion
                        }
                      }
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Excluindo...' : 'Excluir'}
                  </Button>
                )}
                {isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                    Cancelar
                  </Button>
                )}
                {!isEditing && (
                  <Button variant="outline" onClick={() => navigate(`/relatos/logs/${id}`)}>
                        Ver Histórico de Alterações
                  </Button>
                )}
              </>
            </div>
          </div>

          <RelatoComments relatoId={id} />
        </div>
      )}
    </MainLayout>
  );
};

export default RelatoDetailsPage;
