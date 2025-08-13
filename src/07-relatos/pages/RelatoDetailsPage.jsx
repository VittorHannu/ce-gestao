import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import { Button } from '@/01-shared/components/ui/button';
import RelatoForm from '../components/RelatoForm'; // Importa o formulário
import RelatoDisplayDetails from '../components/RelatoDisplayDetails'; // Importa o componente de exibição de detalhes
import { useUserProfile } from '@/04-profile/hooks/useUserProfile'; // Para verificar permissão
import BackButton from '@/01-shared/components/BackButton'; // Importa o BackButton
import RelatoComments from '../components/RelatoComments';
import useRelatoManagement from '../hooks/useRelatoManagement';

const RelatoDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast: _showToast } = useOutletContext();

  const [isEditing, setIsEditing] = useState(false); // Novo estado para modo de edição

  const {
    relato,
    allUsers,
    currentResponsibles,
    setCurrentResponsibles: _setCurrentResponsibles,
    loading,
    error,
    isSaving,
    isDeleting,
    isReproving,
    fetchRelato: _fetchRelato,
    handleUpdateRelato,
    handleReproveRelato,
    handleReapproveRelato,
    handleDeleteRelato
  } = useRelatoManagement(id);

  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile(); // Moved this up
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
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <BackButton />
        <h1 className="text-2xl font-bold ml-4">Detalhes do Relato</h1>
      </div>

      {isEditing ? (
        <RelatoForm
          onSubmit={(formData) => handleUpdateRelato(formData, canManageRelatos)}
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
                        <Button variant="warning" onClick={() => handleReproveRelato('Motivo de reprovação')} disabled={isReproving}>
                          {isReproving ? 'Reprovando...' : 'Reprovar'}
                        </Button>
                      )}
                    </>
                  )
                )}
                {canDeleteRelatos && !isEditing && (
                  <Button variant="destructive" onClick={handleDeleteRelato} disabled={isDeleting}>
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
    </div>
  );
};

export default RelatoDetailsPage;
