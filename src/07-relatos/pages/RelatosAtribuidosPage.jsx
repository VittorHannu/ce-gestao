import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/01-shared/lib/supabase';
import { useToast } from '@/01-shared/hooks/useToast';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import RelatoCard from '../components/RelatoCard';
import BackButton from '@/01-shared/components/BackButton';
import { Button } from '@/01-shared/components/ui/button'; // Importar Button
import MainLayout from '@/01-shared/components/MainLayout';

const RelatosAtribuidosPage = () => {
  const [relatos, setRelatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('notConcluded'); // Estado para o filtro: 'all' ou 'notConcluded'
  const { showToast } = useToast();

  const fetchAssignedRelatos = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      showToast('Você precisa estar logado para ver os relatos atribuídos.', 'error');
      setLoading(false);
      return;
    }

    // Primeiro, busca os IDs dos relatos atribuídos a este usuário
    const { data: assignedRelatoIds, error: assignedIdsError } = await supabase
      .from('relato_responsaveis')
      .select('relato_id')
      .eq('user_id', user.id);

    if (assignedIdsError) {
      console.error('Erro ao buscar IDs de relatos atribuídos:', assignedIdsError);
      showToast('Erro ao carregar relatos atribuídos.', 'error');
      setLoading(false);
      return;
    }

    const relatoIds = assignedRelatoIds.map(item => item.relato_id);

    if (relatoIds.length === 0) {
      setRelatos([]);
      setLoading(false);
      return;
    }

    // Agora, busca os detalhes dos relatos usando os IDs obtidos
    let query = supabase
      .from('relatos')
      .select('*, relato_code')
      .in('id', relatoIds);

    // Aplica o filtro de "não concluídos" se o filterType for 'notConcluded'
    if (filterType === 'notConcluded') {
      query = query.is('data_conclusao_solucao', null);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar relatos atribuídos:', error);
      showToast('Erro ao carregar relatos atribuídos.', 'error');
    } else {
      setRelatos(data);
    }
    setLoading(false);
  }, [showToast, filterType]); // Adicionar filterType como dependência

  useEffect(() => {
    fetchAssignedRelatos();
  }, [fetchAssignedRelatos]);

  return (
    <MainLayout
      header={(
        <>
          <BackButton />
          <h1 className="text-2xl font-bold ml-4">Relatos Atribuídos a Você</h1>
        </>
      )}
    >
      <div className="p-4">
        <div className="mb-4 flex space-x-2">
          <Button
            variant={filterType === 'notConcluded' ? 'default' : 'outline'}
            onClick={() => setFilterType('notConcluded')}
          >
            Não Concluídos
          </Button>
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
          >
            Todos
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : relatos.length === 0 ? (
          <p>Nenhum relato atribuído a você {filterType === 'notConcluded' ? 'não concluído' : ''}.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatos.map((relato) => (
              <RelatoCard key={relato.id} relato={relato} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RelatosAtribuidosPage;
