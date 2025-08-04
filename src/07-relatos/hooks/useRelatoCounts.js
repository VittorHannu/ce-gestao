import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '@/01-common/lib/supabase';

const fetchRelatoCounts = async (user) => {
  // Contagem de Todos os Relatos Aprovados
  const { count: totalAprovados, error: errorTotal } = await supabase
    .from('relatos')
    .select('id', { count: 'exact' })
    .eq('status', 'APROVADO');

  if (errorTotal) throw errorTotal;

  // Contagem de Relatos Concluídos
  const { count: concluidos, error: errorConcluidos } = await supabase
    .from('relatos')
    .select('id', { count: 'exact' })
    .eq('status', 'APROVADO')
    .not('data_conclusao_solucao', 'is', null);

  if (errorConcluidos) throw errorConcluidos;

  // Contagem de Relatos Em Andamento
  const { count: emAndamento, error: errorEmAndamento } = await supabase
    .from('relatos')
    .select('id', { count: 'exact' })
    .eq('status', 'APROVADO')
    .not('planejamento_cronologia_solucao', 'is', null)
    .is('data_conclusao_solucao', null);

  if (errorEmAndamento) throw errorEmAndamento;

  // Contagem de Relatos Sem Tratativa
  const { count: semTratativa, error: errorSemTratativa } = await supabase
    .from('relatos')
    .select('id', { count: 'exact' })
    .eq('status', 'APROVADO')
    .is('planejamento_cronologia_solucao', null)
    .is('data_conclusao_solucao', null);

  if (errorSemTratativa) throw errorSemTratativa;

  // Contagem de Relatos Pendentes de Aprovação
  const { count: pendenteAprovacao, error: errorPendenteAprovacao } = await supabase
    .from('relatos')
    .select('id', { count: 'exact' })
    .eq('status', 'PENDENTE');

  if (errorPendenteAprovacao) throw errorPendenteAprovacao;

  // Contagem de Relatos Atribuídos ao Usuário Logado (excluindo concluídos)
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

  return {
    totalAprovados,
    concluidos,
    emAndamento,
    semTratativa,
    pendenteAprovacao,
    relatosAtribuidos
  };
};

export const useRelatoCounts = () => {
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
    queryKey: ['relatoCounts', user?.id],
    queryFn: () => fetchRelatoCounts(user),
    enabled: !loadingUser && !!user // Só executa a query se o usuário estiver carregado e logado
  });
};
