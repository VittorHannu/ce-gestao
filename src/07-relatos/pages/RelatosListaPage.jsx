import React, { useState, useEffect, Fragment } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useDateFilter } from '@/01-shared/hooks/useDateFilter.jsx';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/01-shared/lib/supabase';
import { useToast } from '@/01-shared/hooks/useToast';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import RelatoCard from '../components/RelatoCard';
import PageHeader from '@/01-shared/components/PageHeader';
import SearchInput from '@/01-shared/components/SearchInput';
import { Button } from '@/01-shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/01-shared/components/ui/select';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import { updateRelatoType } from '../services/relatoStatsService';
import MainLayout from '@/01-shared/components/MainLayout';

const PAGE_SIZE = 10;

const fetchRelatosPage = async ({ pageParam = 1, queryKey }) => {
  const [_key, filters] = queryKey;
  const {
    searchTerm, statusFilter, responsibleFilter, startDate, endDate, tipoRelatoFilter, onlyMineFilter
  } = filters;

  const { data, error } = await supabase.rpc('search_relatos_unaccented', {
    p_search_term: searchTerm,
    p_status_filter: statusFilter ? statusFilter.toUpperCase() : null,
    p_responsible_filter: responsibleFilter,
    p_start_date: startDate,
    p_end_date: endDate,
    p_tipo_relato_filter: tipoRelatoFilter,
    p_only_mine: onlyMineFilter,
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

  const queryParams = new URLSearchParams(location.search);
  const statusFilter = queryParams.get('status');
  const tipoRelatoFilter = queryParams.get('tipo_relato');
  const onlyMineFilter = queryParams.get('only_mine') === 'true';

  const { data: userProfile } = useUserProfile();
  const canManageRelatos = userProfile?.can_manage_relatos;
  const [classifyingId, setClassifyingId] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState({});

  const getTitle = () => {
    if (onlyMineFilter) return 'Relatos Criados por Você';
    if (tipoRelatoFilter) return `Relatos de ${tipoRelatoFilter}`;
    switch (statusFilter) {
    case 'aprovado': return 'Todos os Relatos';
    case 'concluido': return 'Relatos Concluídos';
    case 'em_andamento': return 'Relatos Em Andamento';
    case 'sem_tratativa': return 'Relatos Sem Tratativa';
    default: return 'Lista de Relatos';
    }
  };

  const filters = { searchTerm, statusFilter, responsibleFilter, startDate, endDate, tipoRelatoFilter, onlyMineFilter };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['relatos', filters],
    queryFn: fetchRelatosPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page had fewer items than PAGE_SIZE, there are no more pages.
      return lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined;
    }
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleSaveClassification = async (relatoId) => {
    // This logic remains mostly the same, but it will need to update the react-query cache
    // For now, we will just refetch, but a more optimized approach would be to update the cache directly
    // This is a more advanced topic for later.
    const newType = selectedTypes[relatoId];
    const typeToSave = newType === 'CLEAR_SELECTION' ? null : newType;

    setClassifyingId(relatoId);
    try {
      await updateRelatoType(relatoId, typeToSave);
      toast({ title: 'Relato classificado com sucesso!' });
      // Invalidate the query to refetch the data, which is the correct
      // way to update the list when using React Query.
      queryClient.invalidateQueries({ queryKey: ['relatos'] });
    } catch (err) {
      toast({ title: 'Erro ao classificar relato', description: err.message, variant: 'destructive' });
    } finally {
      setClassifyingId(null);
    }
  };

  const relatos = data?.pages.flatMap(page => page) ?? [];

  return (
    <MainLayout header={<PageHeader title={getTitle()} />}>
      <div>
        <div className="mb-4">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Pesquisar relatos..." />
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
            {/* A refetch button could be added here */}
          </div>
        ) : relatos.length === 0 ? (
          <div className="text-center py-10">
            <p>Nenhum relato encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.pages.map((page, i) => (
                <Fragment key={i}>
                  {page.map(relato => (
                    <div key={relato.id} className="p-4 border rounded-lg bg-white">
                      <RelatoCard relato={relato} />
                      {tipoRelatoFilter && (
                        <div className="flex items-center gap-2 mt-4">
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
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default RelatosListaPage;