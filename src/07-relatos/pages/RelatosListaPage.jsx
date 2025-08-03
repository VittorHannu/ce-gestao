import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '@/01-common/lib/supabase';
import { useToast } from '@/01-common/hooks/useToast';
import LoadingSpinner from '@/01-common/components/LoadingSpinner';
import RelatoCard from '../components/RelatoCard';
import BackButton from '@/01-common/components/BackButton';
import SearchInput from '@/01-common/components/SearchInput';

const RelatosListaPage = () => {
  const [relatos, setRelatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  useEffect(() => {
    const fetchRelatos = async () => {
      setLoading(true);
      const queryParams = new URLSearchParams(location.search);
      const statusFilter = queryParams.get('status');

      let query = supabase.from('relatos').select('*, relato_code').eq('status', 'APROVADO');

      if (statusFilter === 'concluido') {
        query = query.not('data_conclusao_solucao', 'is', null);
      } else if (statusFilter === 'em_andamento') {
        query = query.not('planejamento_cronologia_solucao', 'is', null);
        query = query.is('data_conclusao_solucao', null);
      } else if (statusFilter === 'sem_tratativa') {
        query = query.is('planejamento_cronologia_solucao', null);
        query = query.is('data_conclusao_solucao', null);
      }

      // Adiciona filtro de pesquisa se houver um termo
      if (searchTerm) {
        query = query.or(
          `local_ocorrencia.ilike.%${searchTerm}%`,
          `descricao.ilike.%${searchTerm}%`,
          `riscos_identificados.ilike.%${searchTerm}%`,
          `danos_ocorridos.ilike.%${searchTerm}%`,
          `planejamento_cronologia_solucao.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar relatos:', error);
        showToast('Erro ao carregar relatos.', 'error');
      } else {
        setRelatos(data);
      }
      setLoading(false);
    };

    fetchRelatos();
  }, [location.search, searchTerm, showToast]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <BackButton />
        <h1 className="text-2xl font-bold ml-4">{getTitle()}</h1>
      </div>
      <div className="mb-4">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Pesquisar relatos..." />
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
