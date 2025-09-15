import React, { useState, useEffect } from 'react';
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
    handleUpdateRelato,
    handleDeleteRelato,
    userProfile,
    isLoadingProfile
  } = useRelatoManagement(id);

  const [editedDescription, setEditedDescription] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (relato) {
      setEditedDescription(relato.descricao || '');
    }
  }, [relato]);

  const handleDescriptionChange = (newDescription) => {
    setEditedDescription(newDescription);
    if (newDescription !== relato.descricao) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  };

  const handleSave = async () => {
    const success = await handleUpdateRelato({ descricao: editedDescription });
    if (success) {
      setIsDirty(false);
    }
  };

  const handleCancel = () => {
    if (relato) {
      setEditedDescription(relato.descricao || '');
    }
    setIsDirty(false);
  };

  const canDeleteRelatos = userProfile?.can_delete_relatos;

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
          <TabsTrigger value="comments">Comentários</TabsTrigger>
          <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <RelatoDisplayDetails
              relato={relato}
              responsibles={currentResponsibles}
              editedDescription={editedDescription}
              onDescriptionChange={handleDescriptionChange}
              isDirty={isDirty}
            />

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

      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
          <div 
            className="w-full max-w-2xl bg-gray-800 text-white shadow-2xl rounded-xl p-4 pointer-events-auto"
            style={{ 
              marginBottom: 'calc(env(safe-area-inset-bottom, 0px) + env(keyboard-inset-height, 0px))',
              transition: 'margin-bottom 0.2s ease-out'
            }}
          >
            <div className="flex flex-col gap-3">
              <span className="text-sm md:text-base text-center">Você tem alterações não salvas.</span>
              <div className="flex justify-center items-center gap-2">
                <Button variant="ghost" onClick={handleCancel} className="text-white hover:bg-gray-700">
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default RelatoDetailsPage;
