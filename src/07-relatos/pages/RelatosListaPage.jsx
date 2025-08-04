import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/01-common/lib/supabase';
import { useToast } from '@/01-common/hooks/useToast';
import LoadingSpinner from '@/01-common/components/LoadingSpinner';
import RelatoCard from '../components/RelatoCard';
import BackButton from '@/01-common/components/BackButton';
import SearchInput from '@/01-common/components/SearchInput';
import { Button } from '@/core/components/ui/button'; // Importar Button

const RelatosListaPage = () => {
  const [relatos, setRelatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('all'); // 'all', 'with_responsibles', 'without_responsibles'
  const { showToast } = useToast();
  const location = useLocation();

  const getTitle = () => {
    const queryParams = new URLSearchParams(location.search);
    const statusFilter = queryParams.get('status');
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
    const queryParams = new URLSearchParams(location.search);
    const statusFilter = queryParams.get('status');

    console.log('Fetching relatos with:');
    console.log('  statusFilter:', statusFilter);
    console.log('  searchTerm:', searchTerm);
    console.log('  responsibleFilter:', responsibleFilter);

    const { data, error } = await supabase.rpc('search_relatos_unaccented', {
      p_search_term: searchTerm,
      p_status_filter: statusFilter ? statusFilter.toUpperCase() : null,
      p_responsible_filter: responsibleFilter // Passa o novo filtro
    });

    console.log('Supabase query result:');
    console.log('  data:', data);
    console.log('  error:', error);

    if (error) {
      console.error('Erro ao buscar relatos:', error);
      showToast('Erro ao carregar relatos.', 'error');
    } else {
      setRelatos(data);
      console.log('Relatos state after setRelatos:', data);
    }
    setLoading(false);
  }, [location.search, searchTerm, responsibleFilter, showToast]); // Adiciona responsibleFilter como dependência

  useEffect(() => {
    fetchRelatos();
  }, [fetchRelatos]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <BackButton />
        <h1 className="text-2xl font-bold ml-4">{getTitle()}</h1>
      </div>
      <div className="mb-4">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Pesquisar relatos..." />
      </div>

      <div className="mb-4 flex flex-wrap space-x-2">
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
        <LoadingSpinner />
      ) : relatos.length === 0 ? (
        <p>Nenhum relato encontrado para esta categoria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatos.map((relato) => (
            <RelatoCard key={relato.id} relato={relato} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatosListaPage;
