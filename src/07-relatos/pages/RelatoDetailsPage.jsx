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
import { Table, TableBody } from '@/01-shared/components/ui/table';
import ClickableTableRow from '@/01-shared/components/ClickableTableRow';
import SectionEditModal from '../components/modals/SectionEditModal';
import { supabase } from '@/01-shared/lib/supabase';
import { cn } from '@/lib/utils';

// Helper to create a clickable section
const ClickableSection = ({ onClick, isEditable, children }) => (
  <div
    onClick={isEditable ? onClick : undefined}
    className={cn(
      'p-4 bg-white rounded-lg shadow-sm',
      isEditable && 'cursor-pointer hover:bg-gray-50 transition-colors'
    )}
  >
    {children}
  </div>
);

const RelatoDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [relatorName, setRelatorName] = useState('Carregando...');
  const [modalState, setModalState] = useState({ isOpen: false, config: null, title: '' });

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

  const canDeleteRelatos = userProfile?.can_delete_relatos;
  const canManageRelatos = userProfile?.can_manage_relatos;

  // --- Field and Section Configurations ---
  const sectionsConfig = {
    cabecalho: {
      title: 'Cabeçalho',
      fields: [
        { key: 'relato_code', label: 'Código do Relato', editable: false },
        { key: 'status', label: 'Status de Aprovação', editable: canManageRelatos, type: 'select', options: [
          { value: 'Pendente', label: 'Pendente' },
          { value: 'Aprovado', label: 'Aprovado' },
          { value: 'Reprovado', label: 'Reprovado' },
        ]},
        { key: 'tipo_relato', label: 'Tipo de Relato', editable: false },
      ]
    },
    ocorrencia: {
      title: 'Detalhes da Ocorrência',
      fields: [
        { key: 'data_ocorrencia', label: 'Data da Ocorrência', editable: canManageRelatos, type: 'date' },
        { key: 'hora_aproximada_ocorrencia', label: 'Hora Aproximada', editable: canManageRelatos, type: 'time' },
        { key: 'local_ocorrencia', label: 'Local da Ocorrência', editable: canManageRelatos, type: 'text' },
        { key: 'descricao', label: 'Descrição', editable: canManageRelatos, type: 'textarea' },
      ]
    },
    analise: {
      title: 'Análise',
      fields: [
        { key: 'riscos_identificados', label: 'Riscos Identificados', editable: canManageRelatos, type: 'textarea' },
        { key: 'danos_ocorridos', label: 'Danos Ocorridos', editable: canManageRelatos, type: 'textarea' },
      ]
    },
    tratativa: {
        title: 'Tratativa',
        fields: [
            { key: 'treatment_status', label: 'Status da Tratativa', editable: false },
            { key: 'responsibles', label: 'Responsáveis', editable: canManageRelatos, type: 'text' }, // Placeholder, should be a multi-user select
            { key: 'planejamento_cronologia_solucao', label: 'Planejamento da Solução', editable: canManageRelatos, type: 'textarea' },
            { key: 'data_conclusao_solucao', label: 'Data de Conclusão', editable: canManageRelatos, type: 'date' },
            { key: 'concluido_sem_data', label: 'Concluído Sem Data', editable: canManageRelatos, type: 'select', options: [{value: true, label: 'Sim'}, {value: false, label: 'Não'}] },
        ]
    },
    adicionais: {
        title: 'Informações Adicionais',
        fields: [
            { key: 'relatorName', label: 'Relator', editable: false },
            { key: 'is_anonymous', label: 'Anônimo', editable: false, format: (val) => val ? 'Sim' : 'Não' },
            { key: 'created_at', label: 'Data de Criação', editable: false, format: (val) => new Date(val).toLocaleString() },
        ]
    }
  };

  const openModal = (sectionKey) => {
    const config = sectionsConfig[sectionKey];
    if (config) {
      setModalState({ isOpen: true, config: config.fields, title: config.title });
    }
  };

  const handleSaveChanges = async (changes) => {
    const success = await handleUpdateRelato(changes, canManageRelatos);
    if (success) {
      setModalState({ isOpen: false, config: null, title: '' });
    }
    return success;
  };

  useEffect(() => {
    const fetchRelatorName = async () => {
      if (!relato) return;
      if (relato.is_anonymous) {
        setRelatorName('Anônimo');
        return;
      }
      if (relato.user_id) {
        const { data, error } = await supabase.from('profiles').select('full_name').eq('id', relato.user_id).single();
        setRelatorName(error ? 'Erro' : data?.full_name || 'Não informado');
      } else {
        setRelatorName('Não informado');
      }
    };
    fetchRelatorName();
  }, [relato]);

  if (loading || isLoadingProfile) return <LoadingSpinner />;
  if (error) return <div className="container p-4 text-red-500">{error.message || error}</div>;
  if (!relato) return <div className="container p-4">Relato não encontrado.</div>;

  const getTreatmentStatusText = () => {
    if (relato.data_conclusao_solucao) return 'Concluído';
    if (relato.concluido_sem_data) return 'Concluído (sem data)';
    if (relato.planejamento_cronologia_solucao) return 'Em Andamento';
    return 'Sem Tratativa';
  };

  const responsibleNames = currentResponsibles.map(r => r.full_name).join(', ') || null;
  const dynamicRelato = { ...relato, relatorName, treatment_status: getTreatmentStatusText(), responsibles: responsibleNames };

  const renderTabContent = () => {
    if (activeTab === 'comments') return <RelatoComments relatoId={id} />;
    if (activeTab === 'logs') return <RelatoLogs relatoId={id} />;

    return (
      <div className="space-y-4">
        {Object.entries(sectionsConfig).map(([key, section]) => (
          <ClickableSection key={key} onClick={() => openModal(key)} isEditable={section.fields.some(f => f.editable)}>
            <h3 className="text-lg font-semibold mb-2 px-4">{section.title}</h3>
            <Table>
              <TableBody>
                {section.fields.map(field => (
                  <ClickableTableRow
                    key={field.key}
                    label={field.label}
                    value={field.format ? field.format(dynamicRelato[field.key]) : dynamicRelato[field.key]}
                    isEditable={false} // Rows themselves are not clickable anymore
                  />
                ))}
              </TableBody>
            </Table>
          </ClickableSection>
        ))}

        <div className="mt-6 flex justify-center">
          {canDeleteRelatos && (
            <Button variant="destructive" onClick={async () => {
              if (window.confirm('Tem certeza que deseja excluir este relato?')) {
                const success = await handleDeleteRelato();
                if (success) navigate('/relatos');
              }
            }} disabled={isDeleting}>
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <MainLayout header={<PageHeader title="Detalhes do Relato" />}>
      <div className="w-full">
        <div className="grid grid-cols-3 gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
          {/* Tab Buttons */}
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
        <div className="mt-4">{renderTabContent()}</div>
      </div>

      <SectionEditModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, config: null, title: '' })}
        title={modalState.title}
        relato={relato}
        fieldsConfig={modalState.config}
        onSave={handleSaveChanges}
        isSaving={isSaving}
      />
    </MainLayout>
  );
};

export default RelatoDetailsPage;
