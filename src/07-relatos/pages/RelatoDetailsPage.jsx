import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import { cn } from '@/lib/utils';
import RelatoImages from '../components/RelatoImages';
import { useRelatoClassifications } from '../hooks/useRelatoClassifications';


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
  const { selectedClassifications, isLoading: isLoadingClassifications } = useRelatoClassifications(id);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname + (location.state?.from?.search || '');
  const scrollPositionKey = `scrollPos:${location.pathname}`;

  const {
    relato,
    loading,
    error,
    isDeleting,
    handleDeleteRelato,
    userProfile,
    isLoadingProfile
  } = useRelatoManagement(id);

  useEffect(() => {
    if (!loading && !isLoadingProfile && relato) {
      const savedPosition = sessionStorage.getItem(scrollPositionKey);
      if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition, 10));
        sessionStorage.removeItem(scrollPositionKey);
      }
    }
  }, [loading, isLoadingProfile, relato, scrollPositionKey]);

  useEffect(() => {
    return () => {
      sessionStorage.setItem(scrollPositionKey, window.scrollY);
    };
  }, [scrollPositionKey]);

  const [activeTab, setActiveTab] = useState('details');

  const canDeleteRelatos = userProfile?.can_delete_relatos;
  const canManageRelatos = userProfile?.can_manage_relatos;

  const sectionsConfig = {
    cabecalho: {
      title: 'Cabeçalho',
      fields: [
        { key: 'relato_code', label: 'Código do Relato', editable: false },
        { key: 'status', label: 'Status de Aprovação', editable: canManageRelatos, type: 'select', options: [
          { value: 'Pendente', label: 'Pendente' },
          { value: 'Aprovado', label: 'Aprovado' },
          { value: 'Reprovado', label: 'Reprovado' }
        ] },
        { key: 'tipo_relato', label: 'Tipo de Relato', editable: false }
      ]
    },
    ocorrencia: {
      title: 'Detalhes da Ocorrência',
      fields: [
        { key: 'data_ocorrencia', label: 'Data da Ocorrência', editable: canManageRelatos, type: 'date' },
        { key: 'hora_aproximada_ocorrencia', label: 'Hora Aproximada', editable: canManageRelatos, type: 'time' },
        { key: 'local_ocorrencia', label: 'Local da Ocorrência', editable: canManageRelatos, type: 'text' },
        { key: 'descricao', label: 'Descrição', editable: canManageRelatos, type: 'textarea' }
      ]
    },
    analise: {
      title: 'Análise',
      fields: [
        { key: 'riscos_identificados', label: 'Riscos Identificados', editable: canManageRelatos, type: 'textarea' },
        { key: 'danos_ocorridos', label: 'Danos Ocorridos', editable: canManageRelatos, type: 'textarea' }
      ]
    },
    classificacoes: {
      title: 'Classificações',
      fields: [
        { key: 'classificacoes_selecionadas', label: 'Itens Selecionados', editable: canManageRelatos, type: 'custom' }
      ]
    },
    tratativa: {
      title: 'Tratativa',
      fields: [
        { key: 'treatment_status', label: 'Status da Tratativa', editable: false },
        { key: 'responsibles', label: 'Responsáveis', editable: canManageRelatos, type: 'text' },
        { key: 'planejamento_cronologia_solucao', label: 'Planejamento da Solução', editable: canManageRelatos, type: 'textarea' },
        { key: 'concluido_sem_data', label: 'Concluído (sem data de conclusão)', editable: canManageRelatos, type: 'checkbox' },
        { key: 'data_conclusao_solucao', label: 'Data de Conclusão', editable: canManageRelatos, type: 'date' }
      ]
    },
    adicionais: {
      title: 'Informações Adicionais',
      fields: [
        { key: 'relatorName', label: 'Relator', editable: false },
        { key: 'is_anonymous', label: 'Anônimo', editable: false, format: (val) => val ? 'Sim' : 'Não' },
        { key: 'created_at', label: 'Data de Criação', editable: false, format: (val) => new Date(val).toLocaleString() }
      ]
    }
  };

  const navigateToEditSection = (sectionKey) => {
    navigate(`/relatos/detalhes/${id}/edit/${sectionKey}`, { state: location.state });
  };

  if (loading || isLoadingProfile || isLoadingClassifications) return <LoadingSpinner />;
  if (error) return <div className="container p-4 text-red-500">{error.message || error}</div>;
  if (!relato) return <div className="container p-4">Relato não encontrado.</div>;

  const getTreatmentStatusText = () => {
    if (relato.data_conclusao_solucao) return 'Concluído';
    if (relato.concluido_sem_data) return 'Concluído (sem data)';
    if (relato.planejamento_cronologia_solucao) return 'Em Andamento';
    return 'Sem Tratativa';
  };

  const responsibleNames = relato.responsaveis?.map(r => r.full_name).join(', ') || 'Nenhum';
  const relatorName = relato.is_anonymous ? 'Anônimo' : relato.relator_full_name || 'Não informado';
  const classificacoesText = selectedClassifications && selectedClassifications.length > 0
    ? `${selectedClassifications.length} itens selecionados`
    : 'Nenhum item selecionado';
  const dynamicRelato = { ...relato, relatorName, treatment_status: getTreatmentStatusText(), responsibles: responsibleNames, classificacoes_selecionadas: classificacoesText };

  const renderTabContent = () => {
    if (activeTab === 'comments') return <RelatoComments relatoId={id} />;
    if (activeTab === 'logs') return <RelatoLogs relatoId={id} />;

    return (
      <div className="space-y-4">
        {Object.entries(sectionsConfig).map(([key, section]) => (
          <ClickableSection key={key} onClick={() => navigateToEditSection(key)} isEditable={section.fields.some(f => f.editable)}>
            <h3 className="text-lg font-semibold mb-2 px-4">{section.title}</h3>
            <Table>
              <TableBody>
                {section.fields.map(field => (
                  <ClickableTableRow
                    key={field.key}
                    label={field.label}
                    value={field.format ? field.format(dynamicRelato[field.key]) : dynamicRelato[field.key]}
                    isEditable={false}
                  />
                ))}
              </TableBody>
            </Table>
            {key === 'ocorrencia' && (relato.images && relato.images.length > 0) && (
              <div className="px-2 pb-2">
                <RelatoImages relato={relato} userProfile={userProfile} />
              </div>
            )}
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
    <MainLayout header={<PageHeader title="Detalhes do Relato" to={from || '/relatos/lista'} />}>
      <div className="w-full">
        <div className="grid grid-cols-3 gap-1 mb-4 bg-gray-300 p-1 rounded-lg">
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
    </MainLayout>
  );
};

export default RelatoDetailsPage;
