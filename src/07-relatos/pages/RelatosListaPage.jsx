import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '@/01-common/lib/supabase';
import { useToast } from '@/01-common/hooks/useToast';
import LoadingSpinner from '@/01-common/components/LoadingSpinner';

const RelatosListaPage = () => {
  const [relatos, setRelatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const fetchRelatos = async () => {
      setLoading(true);
      const queryParams = new URLSearchParams(location.search);
      const statusFilter = queryParams.get('status');

      let query = supabase.from('relatos').select('*').eq('status', 'APROVADO');

      if (statusFilter === 'concluido') {
        query = query.not('data_conclusao_solucao', 'is', null);
      } else if (statusFilter === 'em_andamento') {
        query = query.not('planejamento_cronologia_solucao', 'is', null);
        query = query.is('data_conclusao_solucao', null);
      } else if (statusFilter === 'sem_tratativa') {
        query = query.is('planejamento_cronologia_solucao', null);
        query = query.is('data_conclusao_solucao', null);
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
  }, [location.search, showToast]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const getTitle = () => {
    const queryParams = new URLSearchParams(location.search);
    const statusFilter = queryParams.get('status');
    switch (statusFilter) {
      case 'aprovado':
        return 'Todos os Relatos Aprovados';
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{getTitle()}</h1>
      
      {relatos.length === 0 ? (
        <p>Nenhum relato encontrado para esta categoria.</p>
      ) : (
        <div className="space-y-4">
          {relatos.map((relato) => (
            <Link to={`/relatos/detalhes/${relato.id}`} key={relato.id} className="block">
              <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <h2 className="text-lg font-semibold">{relato.local_ocorrencia}</h2>
                <p className="text-sm text-gray-500">Data: {new Date(relato.data_ocorrencia).toLocaleDateString()}</p>
                <p className="mt-2">{relato.descricao}</p>
                {relato.planejamento_cronologia_solucao && (
                  <p className="text-sm text-gray-600 mt-2">Planejamento: {relato.planejamento_cronologia_solucao}</p>
                )}
                {relato.data_conclusao_solucao && (
                  <p className="text-sm text-gray-600">Concluído em: {new Date(relato.data_conclusao_solucao).toLocaleDateString()}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatosListaPage;
