import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import { Button } from '@/01-shared/components/ui/button';
import PageHeader from '@/01-shared/components/PageHeader';
import RelatoComments from '../components/RelatoComments';
import MainLayout from '@/01-shared/components/MainLayout';
import { useRelatoManagement } from '../hooks/useRelatoManagement';
import RelatoLogs from '../components/RelatoLogs';
import { DocumentTextIcon, ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/24/solid';
import RelatoForm from '../components/form-fields/RelatoForm';

const editableFieldKeys = [
  'status',
  'data_ocorrencia',
  'hora_aproximada_ocorrencia',
  'local_ocorrencia',
  'descricao',
  'riscos_identificados',
  'danos_ocorridos',
  'planejamento_cronologia_solucao',
  'data_conclusao_solucao'
];

const RelatoDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');

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

  const [editedFields, setEditedFields] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (relato) {
      const initialFields = {};
      editableFieldKeys.forEach(key => {
        initialFields[key] = relato[key] || '';
      });
      setEditedFields(initialFields);
      setIsDirty(false);
    }
  }, [relato]);

  const handleFieldChange = (field, value) => {
    setEditedFields(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    const changes = {};
    if (!editedFields) return;

    editableFieldKeys.forEach(key => {
      if (editedFields[key] !== (relato[key] || '')) {
        changes[key] = editedFields[key];
      }
    });

    if (editedFields.reproval_reason) {
      changes.reproval_reason = editedFields.reproval_reason;
    }

    if (Object.keys(changes).length > 0) {
      const success = await handleUpdateRelato(changes, canManageRelatos);
      if (success) {
        setIsDirty(false);
      }
    } else {
      setIsDirty(false);
    }
  };

  const handleCancel = () => {
    if (relato) {
      const initialFields = {};
      editableFieldKeys.forEach(key => {
        initialFields[key] = relato[key] || '';
      });
      setEditedFields(initialFields);
    }
    setIsDirty(false);
  };

  const canDeleteRelatos = userProfile?.can_delete_relatos;
  const canManageRelatos = userProfile?.can_manage_relatos;

  if (loading || isLoadingProfile) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error.message || error}</div>;
  }

  if (!relato) {
    return <div className="container mx-auto p-4">Relato não encontrado.</div>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
    case 'comments':
      return <RelatoComments relatoId={id} />;
    case 'logs':
      return <RelatoLogs relatoId={id} />;
    case 'details':
    default:
      return (
        <>
          <RelatoForm
            relato={relato}
            responsibles={currentResponsibles}
            editedFields={editedFields}
            onFieldChange={handleFieldChange}
            isDirty={isDirty}
            canManageRelatos={canManageRelatos}
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
        </>
      );
    }
  };

  return (
    <MainLayout
      header={<PageHeader title="Detalhes do Relato" />}
    >
      <div className="w-full">
        <div className="grid grid-cols-3 gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={activeTab === 'details' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('details')}
            className={`flex-1 flex-col h-auto py-2 px-1 text-xs ${activeTab === 'details' ? 'bg-white text-black' : ''}`}
          >
            <DocumentTextIcon className="w-5 h-5 mb-1" />
            <span>Detalhes</span>
          </Button>
          <Button
            variant={activeTab === 'comments' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('comments')}
            className={`flex-1 flex-col h-auto py-2 px-1 text-xs ${activeTab === 'comments' ? 'bg-white text-black' : ''}`}
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5 mb-1" />
            <span>Comentários</span>
          </Button>
          <Button
            variant={activeTab === 'logs' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('logs')}
            className={`flex-1 flex-col h-auto py-2 px-1 text-xs ${activeTab === 'logs' ? 'bg-white text-black' : ''}`}
          >
            <ClockIcon className="w-5 h-5 mb-1" />
            <span>Logs</span>
          </Button>
        </div>

        <div className="mt-4">
          {renderTabContent()}
        </div>
      </div>

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
