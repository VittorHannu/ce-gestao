import React, { useState, useEffect, useCallback } from 'react';
import { useDateFilter } from '@/01-shared/hooks/useDateFilter.jsx';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/01-shared/lib/supabase';
import { useToast } from '@/01-shared/hooks/useToast';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import RelatoCard from '../components/RelatoCard';
import BackButton from '@/01-shared/components/BackButton';
import SearchInput from '@/01-shared/components/SearchInput';
import { Button } from '@/01-shared/components/ui/button'; // Importar Button
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/01-shared/components/ui/select';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import { updateRelatoType } from '../services/relatoStatsService';
import _RelatoDisplayDetails from '../components/RelatoDisplayDetails';
import MainLayout from '@/01-shared/components/MainLayout';

const RelatosListaPage = () => {
  const [relatos, setRelatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReloadButtonOnTimeout, setShowReloadButtonOnTimeout] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('all'); // 'all', 'with_responsibles', 'without_responsibles'
  const { startDate, endDate } = useDateFilter();
  const { toast } = useToast();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const tipoRelatoFilter = queryParams.get('tipo_relato');

  const { data: userProfile, isLoading: _isLoadingProfile } = useUserProfile();
  const canManageRelatos = userProfile?.can_manage_relatos;
  const [classifyingId, setClassifyingId] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState({});

  const getTitle = () => {
    const queryParams = new URLSearchParams(location.search);
    const statusFilter = queryParams.get('status');
    const tipoRelatoFilter = queryParams.get('tipo_relato');
    const onlyMineFilter = queryParams.get('only_mine');

    if (onlyMineFilter) {
      return 'Relatos Criados por Você';
    }

    if (tipoRelatoFilter) {
      return `Relatos de ${tipoRelatoFilter}`;
    }

    switch (statusFilter) {
    case 'aprovado':
      return 'Todos os Relatos';
    case 'concluido':
      return 'Relatos Concluídos';
    case 'em_andamento':
      return 'Relatos Em Andamento';
    case 'sem_tratativa':
      return 'Relatos Sem Tratativa';
    default:
      return 'Lista de Relatos';
    }
  };

  const fetchRelatos = useCallback(async () => {
    setLoading(true);
    // Clear previous error when retrying
    // setError(null); // This is handled by showToast, but good to explicitly clear
    const queryParams = new URLSearchParams(location.search);
    const statusFilter = queryParams.get('status');
    const onlyMineFilter = queryParams.get('only_mine') === 'true';

    console.log('Fetching relatos with:');
    console.log('  statusFilter:', statusFilter);
    console.log('  searchTerm:', searchTerm);
    console.log('  responsibleFilter:', responsibleFilter);
    console.log('  onlyMineFilter:', onlyMineFilter);

    const { data, error } = await supabase.rpc('search_relatos_unaccented', {
      p_search_term: searchTerm,
      p_status_filter: statusFilter ? statusFilter.toUpperCase() : null,
      p_responsible_filter: responsibleFilter,
      p_start_date: startDate,
      p_end_date: endDate,
      p_tipo_relato_filter: tipoRelatoFilter, // New parameter
      p_only_mine: onlyMineFilter
    });

    console.log('Supabase query result:');
    console.log('  data:', data);
    console.log('  error:', error);

    if (error) {
      console.error('Erro ao buscar relatos:', error);
      toast({ title: 'Erro ao carregar relatos.', variant: 'destructive' });
      // Set error state to display reload button
      setError(error);
    } else {
      let filteredData = data;
      // Only apply this filter if no specific status (like 'reprovado' or 'pendente') is requested
      if (!statusFilter || (statusFilter !== 'REPROVADO' && statusFilter !== 'PENDENTE')) {
        filteredData = data.filter(relato =>
          relato.status !== 'PENDENTE' && relato.status !== 'REPROVADO'
        );
      }
      setRelatos(filteredData);
      console.log('Relatos state after setRelatos:', filteredData);
      // Clear error state if data loaded successfully
      setError(null);
    }
    setLoading(false);
  }, [location.search, searchTerm, responsibleFilter, toast, startDate, endDate, tipoRelatoFilter]);

  const handleSaveClassification = async (relatoId) => {
    const newType = selectedTypes[relatoId];
    // If newType is an empty string (from "Nenhum"), set it to null for the database
    const typeToSave = newType === 'CLEAR_SELECTION' ? null : newType;

    setClassifyingId(relatoId);
    try {
      await updateRelatoType(relatoId, typeToSave); // Use typeToSave
      toast({ title: 'Relato classificado com sucesso!' });
      // Filter out the classified relato from the state instead of reloading all relatos
      setRelatos(prevRelatos => prevRelatos.filter(r => r.id !== relatoId));
      // Also remove the selected type for this relato from the selectedTypes state
      setSelectedTypes(prev => {
        const newState = { ...prev };
        delete newState[relatoId];
        return newState;
      });
    } catch (err) {
      toast({ title: 'Erro ao classificar relato', description: err.message, variant: 'destructive' });
    } finally {
      setClassifyingId(null);
    }
  };

  useEffect(() => {
    fetchRelatos();
  }, [fetchRelatos, tipoRelatoFilter]);

  useEffect(() => {
    let timeoutId;
    if (loading) {
      timeoutId = setTimeout(() => {
        setShowReloadButtonOnTimeout(true);
      }, 5000); // 5 seconds
    }

    // Cleanup function: This runs when the component unmounts or when 'loading' changes
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Also reset the state when loading finishes or component unmounts
      setShowReloadButtonOnTimeout(false);
    };
  }, [loading]); // Dependency array: runs when 'loading' changes

  return (
    <MainLayout
      header={(
        <>
          <BackButton />
          <h1 className="text-2xl font-bold ml-4">{getTitle()}</h1>
        </>
      )}
    >
      <div className="p-4">
        <div className="mb-4">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Pesquisar relatos..." />
        </div>

        <div className="mb-4 flex flex-wrap space-x-2 gap-y-2">
          <Button
            variant={responsibleFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setResponsibleFilter('all')}
          >
            Todos
          </Button>
          <Button
            variant={responsibleFilter === 'with_responsibles' ? 'default' : 'outline'}
            onClick={() => setResponsibleFilter('with_responsibles')}
          >
            Com Responsáveis
          </Button>
          <Button
            variant={responsibleFilter === 'without_responsibles' ? 'default' : 'outline'}
            onClick={() => setResponsibleFilter('without_responsibles')}
          >
            Sem Responsáveis
          </Button>
        </div>
        
        {loading ? (
          <>
            <LoadingSpinner />
            {showReloadButtonOnTimeout && (
              <div className="text-center mt-4">
                <p className="mb-2">O carregamento está demorando mais que o esperado.</p>
                <Button onClick={fetchRelatos}>Tentar Novamente</Button>
              </div>
            )}
          </>
        ) : error ? ( // Display error message and reload button
          <div className="container mx-auto p-4 text-red-500 flex flex-col items-center justify-center">
            <p className="mb-4">Erro ao carregar dados: {error.message}</p>
            <Button onClick={fetchRelatos}>Tentar Novamente</Button>
          </div>
        ) : relatos.length === 0 ? (
          <div className="text-center py-10">
            {userProfile && !userProfile.can_view_all_relatos ? (
              <p className="text-gray-600 bg-gray-100 p-4 rounded-md">
                Nota: Sua lista mostra apenas os relatos que você criou ou pelos quais é responsável.
              </p>
            ) : (
              <p>Nenhum relato encontrado para esta categoria.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatos.map((relato) => (
              <div key={relato.id} className="p-4 border rounded-lg bg-white">
                <RelatoCard relato={relato} />
                {tipoRelatoFilter && ( // Render classification UI only if tipoRelatoFilter is present
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
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RelatosListaPage;
