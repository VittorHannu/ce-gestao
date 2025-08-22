import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useDateFilter } from '@/01-shared/hooks/useDateFilter';
import { supabase } from '@/01-shared/lib/supabase';

const fetchRelatoCounts = async (user, startDate, endDate) => {
  // 1. Busca as estatísticas globais usando a nova e eficiente função RPC.
  const { data: globalStats, error: errorGlobal } = await supabase.rpc('get_dashboard_stats', {
    p_start_date: startDate,
    p_end_date: endDate
  });

  if (errorGlobal) throw errorGlobal;

  // 2. Busca a contagem de relatos atribuídos, que é específica para o usuário e não precisa de bypass.
  let relatosAtribuidos = 0;
  if (user) {
    const { count, error } = await supabase
      .from('relato_responsaveis')
      .select('relato_id!inner(id, data_conclusao_solucao)', { count: 'exact' })
      .eq('user_id', user.id)
      .is('relato_id.data_conclusao_solucao', null);

    if (error) {
      console.error('Erro ao buscar relatos atribuídos:', error);
      // Não lançar erro aqui para não quebrar as outras contagens
    } else {
      relatosAtribuidos = count;
    }
  }

  // 3. Combina os resultados das estatísticas globais com a contagem específica do usuário.
  return {
    ...globalStats,
    relatosAtribuidos
  };
};

export const useRelatoCounts = () => {
  const { startDate, endDate } = useDateFilter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoadingUser(false);
    };
    getUser();
  }, []);

  return useQuery({
    queryKey: ['relatoCounts', user?.id, startDate, endDate],
    queryFn: () => fetchRelatoCounts(user, startDate, endDate),
    enabled: !loadingUser && !!user // Só executa a query se o usuário estiver carregado e logado
  });
};
