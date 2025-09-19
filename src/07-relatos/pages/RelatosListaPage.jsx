import React, { useState, useEffect, Fragment } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useDateFilter } from '@/01-shared/hooks/useDateFilter.jsx';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/01-shared/lib/supabase';
import { useToast } from '@/01-shared/hooks/useToast';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import RelatoCard from '../components/RelatoCard';
import RelatoAprovacaoCard from '../components/RelatoAprovacaoCard';
import PageHeader from '@/01-shared/components/PageHeader';
import SearchInput from '@/01-shared/components/SearchInput';
import { Button } from '@/01-shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/01-shared/components/ui/select';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import { updateRelatoType } from '../services/relatoStatsService';
import MainLayout from '@/01-shared/components/MainLayout';
import ViewOptionsModal from '../components/ViewOptionsModal';
import { Settings2 } from 'lucide-react';

const PAGE_SIZE = 10;

const fetchRelatosPage = async ({ pageParam = 1, queryKey }) => {
  const [_key, filters] = queryKey;
  const {
    searchTerm, statusFilter, responsibleFilter, startDate, endDate, tipoRelatoFilter, onlyMineFilter, assignedToMeFilter
  } = filters;

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc('search_relatos_unaccented', {
    p_search_term: searchTerm,
    p_status_filter: statusFilter ? statusFilter.toUpperCase() : null,
    p_responsible_filter: responsibleFilter,
    p_start_date: startDate,
    p_end_date: endDate,
    p_tipo_relato_filter: tipoRelatoFilter,
    p_only_mine: onlyMineFilter,
    p_assigned_to_user_id: assignedToMeFilter ? user?.id : null,
    p_page_number: pageParam,
    p_page_size: PAGE_SIZE
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const RelatosListaPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const { ref, inView } = useInView();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('all');
  const { startDate, endDate } = useDateFilter();

  const [viewOptions, setViewOptions] = useState({
    showDescription: true,
    showRisks: true,
    showSolution: false,
    showDamage: false,
    showTipoRelato: false,
    showTreatmentStatus: false,
    showResponsibles: false
  });

  const handleViewOptionsChange = (option) => {
    setViewOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const queryParams = new URLSearchParams(location.search);
  const statusFilterParam = queryParams.get('status');
  const tipoRelatoFilter = queryParams.get('tipo_relato');
  const onlyMineFilter = queryParams.get('only_mine') === 'true';
  const assignedToMeFilter = queryParams.get('assigned_to_me') === 'true';

  const statusFilter = statusFilterParam || 'aprovado';

  const { data: userProfile } = useUserProfile();
  const canManageRelatos = userProfile?.can_manage_relatos;
  const [classifyingId, setClassifyingId] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState({});

  const getTitle = () => {
    if (onlyMineFilter) return 'Relatos Criados por Você';
    if (assignedToMeFilter) return 'Relatos Atribuídos a Você';
    if (tipoRelatoFilter) return `Relatos de ${tipoRelatoFilter}`;
    switch (statusFilter) {
    case 'aprovado': return 'Todos os Relatos';
    case 'concluido': return 'Relatos Concluídos';
    case 'em_andamento': return 'Relatos Em Andamento';
    case 'sem_tratativa': return 'Relatos Sem Tratativa';
    case 'pendente': return 'Relatos Pendentes de Aprovação';
    case 'reprovado': return 'Relatos Reprovados';
    default: return 'Lista de Relatos';
    }
  };

  const filters = { searchTerm, statusFilter, responsibleFilter, startDate, endDate, tipoRelatoFilter, onlyMineFilter, assignedToMeFilter };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch
  } = useInfiniteQuery({
    queryKey: ['relatos', filters],
    queryFn: fetchRelatosPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined;
    }
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleSaveClassification = async (relatoId) => {
    const newType = selectedTypes[relatoId];
    const typeToSave = newType === 'CLEAR_SELECTION' ? null : newType;

    setClassifyingId(relatoId);
    try {
      await updateRelatoType(relatoId, typeToSave);
      toast({ title: 'Relato classificado com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['relatos'] });
    } catch (err) {
      toast({ title: 'Erro ao classificar relato', description: err.message, variant: 'destructive' });
    } finally {
      setClassifyingId(null);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('relatos')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro ao atualizar o status', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Relato ${newStatus.toLowerCase()} com sucesso!` });
      refetch();
    }
  };

  const relatos = data?.pages.flatMap(page => page) ?? [];

  return (
    <MainLayout header={<PageHeader title={getTitle()} />}>
      <div>
        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="flex-grow">
            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Pesquisar relatos..." />
          </div>
          <ViewOptionsModal viewOptions={viewOptions} onViewOptionsChange={handleViewOptionsChange}>
            <Button variant="outline" size="lg" className="px-3">
              <Settings2 className="h-5 w-5" />
            </Button>
          </ViewOptionsModal>
        </div>

        <div className="mb-4 flex flex-wrap space-x-2 gap-y-2">
          <Button variant={responsibleFilter === 'all' ? 'default' : 'outline'} onClick={() => setResponsibleFilter('all')}>Todos</Button>
          <Button variant={responsibleFilter === 'with_responsibles' ? 'default' : 'outline'} onClick={() => setResponsibleFilter('with_responsibles')}>Com Responsáveis</Button>
          <Button variant={responsibleFilter === 'without_responsibles' ? 'default' : 'outline'} onClick={() => setResponsibleFilter('without_responsibles')}>Sem Responsáveis</Button>
        </div>

        {status === 'pending' ? (
          <LoadingSpinner />
        ) : status === 'error' ? (
          <div className="container mx-auto p-4 text-red-500 flex flex-col items-center justify-center">
            <p className="mb-4">Erro ao carregar dados: {error.message}</p>
          </div>
        ) : relatos.length === 0 ? (
          <div className="text-center py-10">
            <p>Nenhum relato encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          <div className="">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.pages.map((page, i) => (
                <Fragment key={i}>
                  {page.map(relato => (
                    <div key={relato.id}>
                      {statusFilter === 'pendente' ? (
                        <RelatoAprovacaoCard relato={relato} onUpdateStatus={handleUpdateStatus} />
                      ) : (
                        <RelatoCard relato={relato} viewOptions={viewOptions}>
                          {tipoRelatoFilter && (
                            <div className="p-4 border-t flex items-center gap-2">
                              <Select
                                onValueChange={(value) => setSelectedTypes(prev => ({ ...prev, [relato.id]: value }))}
                                value={selectedTypes[relato.id]}
                                disabled={classifyingId === relato.id || !canManageRelatos}
                              >
                                <SelectTrigger className="w-[180px] bg-gray-100">
                                  <SelectValue placeholder={tipoRelatoFilter === 'Sem Classificação' ? 'Classificar Tipo' : 'Mudar Classificação'} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CLEAR_SELECTION">Nenhum</SelectItem>
                                  <SelectItem value="Fatal">Fatal</SelectItem>
                                  <SelectItem value="Severo">Severo</SelectItem>
                                  <SelectItem value="Acidente com afastamento">Acidente com afastamento</SelectItem>
                                  <SelectItem value="Acidente sem afastamento">Acidente sem afastamento</SelectItem>
                                  <SelectItem value="Primeiros socorros">Primeiros socorros</SelectItem>
                                  <SelectItem value="Quase acidente">Quase acidente</SelectItem>
                                  <SelectItem value="Condição insegura">Condição insegura</SelectItem>
                                  <SelectItem value="Comportamento inseguro">Comportamento inseguro</SelectItem>
                                </SelectContent>
                              </Select>
                              {canManageRelatos && selectedTypes[relato.id] && selectedTypes[relato.id] !== 'CLEAR_SELECTION' && (
                                <Button
                                  onClick={() => handleSaveClassification(relato.id)}
                                  disabled={classifyingId === relato.id || selectedTypes[relato.id] === relato.tipo_relato}
                                  className="ml-2"
                                >
                                  {classifyingId === relato.id ? 'Salvando...' : 'Salvar'}
                                </Button>
                              )}
                            </div>
                          )}
                        </RelatoCard>
                      )}
                    </div>
                  ))}
                </Fragment>
              ))}
            </div>
            <div ref={ref} className="h-10 flex justify-center items-center">
              {isFetchingNextPage ? (
                <LoadingSpinner />
              ) : hasNextPage ? (
                'Carregar mais'
              ) : (
                'Fim dos resultados'
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RelatosListaPage;