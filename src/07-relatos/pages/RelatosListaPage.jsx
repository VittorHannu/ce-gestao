import React, { useState, useEffect } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/01-shared/lib/supabase';
import { useToast } from '@/01-shared/hooks/useToast';
import MainLayout from '@/01-shared/components/MainLayout';
import PageHeader from '@/01-shared/components/PageHeader';
import SearchInput from '@/01-shared/components/SearchInput';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import { Button } from '@/01-shared/components/ui/button';
import { Checkbox } from '@/01-shared/components/ui/checkbox';
import { Label } from '@/01-shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/01-shared/components/ui/radio-group';
import { Filter } from 'lucide-react';

import DynamicRelatoCard from '../components/DynamicRelatoCard';

import ViewOptionsPopover from '../components/ViewOptionsPopover';

const PAGE_SIZE = 10;

// Updated fetch function to accept more filters
const fetchRelatosPage = async ({ pageParam = 1, queryKey }) => {
  const [_key, allFilters] = queryKey;
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc('search_relatos_unaccented', {
    p_search_term: allFilters.searchTerm,
    p_status_filter: allFilters.status, // This will be an array now
    p_treatment_status_filter: allFilters.treatmentStatus,
    p_start_date: allFilters.startDate,
    p_end_date: allFilters.endDate,
    p_tipo_relato_filter: allFilters.classification,
    p_only_mine: allFilters.onlyMineFilter,
    p_assigned_to_user_id: allFilters.assignedToMeFilter ? user?.id : null,
    p_sort_by: allFilters.sortBy,
    p_page_number: pageParam,
    p_page_size: PAGE_SIZE
  });

  if (error) {
    console.error('Error fetching relatos:', error);
    throw new Error(error.message);
  }

  return data || [];
};

const RelatosListaPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const { ref, inView } = useInView();
  const queryClient = useQueryClient();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Centralized state for all filters
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: [],
    treatmentStatus: [],
    classification: [],
    startDate: null,
    endDate: null,
    sortBy: 'created_at_desc',
  });

  // State for card view options
  const [viewOptions, setViewOptions] = useState({
    showDescription: true,
    showRisks: false,
    showSolution: false,
    showDamage: false,
  });

  const queryParams = new URLSearchParams(location.search);
  const onlyMineFilter = queryParams.get('only_mine') === 'true';
  const assignedToMeFilter = queryParams.get('assigned_to_me') === 'true';

  const getTitle = () => {
    if (onlyMineFilter) return 'Relatos Criados por Você';
    if (assignedToMeFilter) return 'Relatos Atribuídos a Você';
    return 'Lista de Relatos';
  };

  const allFilters = { ...filters, onlyMineFilter, assignedToMeFilter };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status: queryStatus,
  } = useInfiniteQuery({
    queryKey: ['relatos', allFilters],
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

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleCheckboxGroupChange = (filterName, item) => {
    setFilters(prev => {
        const newValues = prev[filterName].includes(item)
            ? prev[filterName].filter(i => i !== item)
            : [...prev[filterName], item];
        return { ...prev, [filterName]: newValues };
    });
  };

  const clearFilters = () => {
    setFilters({
        searchTerm: '',
        status: [],
        treatmentStatus: [],
        classification: [],
        startDate: null,
        endDate: null,
        sortBy: 'created_at_desc',
    });
  }

  const relatos = data?.pages.flatMap(page => page) ?? [];

  return (
    <MainLayout header={<PageHeader title={getTitle()} />}>
      <Collapsible.Root open={isFiltersOpen} onOpenChange={setIsFiltersOpen} className="p-4">
        <div className="flex gap-2 mb-4">
          <SearchInput 
            value={filters.searchTerm} 
            onChange={(value) => handleFilterChange('searchTerm', value)} 
            placeholder="Pesquisar..." 
            className="flex-grow"
          />
          <Collapsible.Trigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </Collapsible.Trigger>
          <ViewOptionsPopover viewOptions={viewOptions} setViewOptions={setViewOptions} />
        </div>

        <Collapsible.Content className="w-full mb-4">
            <div className="p-4 bg-gray-50 border rounded-lg space-y-6">
                <div>
                    <h4 className="font-semibold mb-2">Status do Relato</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {['PENDENTE', 'APROVADO', 'REPROVADO'].map(s => (
                            <div key={s} className="flex items-center gap-2">
                                <Checkbox id={`status-${s}`} checked={filters.status.includes(s)} onCheckedChange={() => handleCheckboxGroupChange('status', s)} />
                                <Label htmlFor={`status-${s}`}>{s.charAt(0) + s.slice(1).toLowerCase()}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-2">Status da Tratativa</h4>
                     <div className="grid grid-cols-2 gap-2">
                        {['CONCLUIDO', 'EM_ANDAMENTO', 'SEM_TRATATIVA'].map(ts => (
                            <div key={ts} className="flex items-center gap-2">
                                <Checkbox id={`ts-${ts}`} checked={filters.treatmentStatus.includes(ts)} onCheckedChange={() => handleCheckboxGroupChange('treatmentStatus', ts)} />
                                <Label htmlFor={`ts-${ts}`}>{ts.replace('_', ' ').charAt(0) + ts.replace('_', ' ').slice(1).toLowerCase()}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-2">Ordenar Por</h4>
                    <RadioGroup value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="created_at_desc" id="sort-created-desc" />
                            <Label htmlFor="sort-created-desc">Mais Recentes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="created_at_asc" id="sort-created-asc" />
                            <Label htmlFor="sort-created-asc">Mais Antigos</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <RadioGroupItem value="data_ocorrencia_desc" id="sort-ocorrencia-desc" />
                            <Label htmlFor="sort-ocorrencia-desc">Data da Ocorrência</Label>
                        </div>
                    </RadioGroup>
                </div>

                <Button onClick={clearFilters} variant="ghost" className="w-full">Limpar Filtros</Button>
            </div>
        </Collapsible.Content>

        {queryStatus === 'pending' ? (
          <LoadingSpinner />
        ) : queryStatus === 'error' ? (
          <div className="text-center py-10 text-red-500">
            <p>Erro ao carregar dados: {error.message}</p>
          </div>
        ) : relatos.length === 0 ? (
          <div className="text-center py-10">
            <p>Nenhum relato encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.map(relato => (
                  <DynamicRelatoCard key={relato.id} relato={relato} viewOptions={viewOptions} />
                ))}
              </React.Fragment>
            ))}
             <div ref={ref} className="h-10 flex justify-center items-center">
              {isFetchingNextPage ? <LoadingSpinner /> : !hasNextPage && 'Fim dos resultados'}
            </div>
          </div>
        )}
      </Collapsible.Root>
    </MainLayout>
  );
};

export default RelatosListaPage;