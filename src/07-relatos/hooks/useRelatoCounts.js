import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useDateFilter } from '@/01-shared/hooks/useDateFilter';
import { supabase } from '@/01-shared/lib/supabase';

const fetchRelatoCounts = async (user, startDate, endDate) => {
  // Contagem de Todos os Relatos Aprovados
  let totalAprovadosQuery = supabase
    .from('relatos')
    .select('id', { count: 'exact' })
    .eq('status', 'APROVADO');
  if (startDate && endDate) {
    totalAprovadosQuery = totalAprovadosQuery.gte('data_ocorrencia', startDate).lte('data_ocorrencia', endDate);
  }
  const { count: totalAprovados, error: errorTotal } = await totalAprovadosQuery;

  if (errorTotal) throw errorTotal;

  // Contagem de Relatos Concluídos
  let concluidosQuery = supabase
    .from('relatos')
    .select('id', { count: 'exact' })
    .eq('status', 'APROVADO')
    .not('data_conclusao_solucao', 'is', null);
  if (startDate && endDate) {
    concluidosQuery = concluidosQuery.gte('data_ocorrencia', startDate).lte('data_ocorrencia', endDate);
  }
  const { count: concluidos, error: errorConcluidos } = await concluidosQuery;

  if (errorConcluidos) throw errorConcluidos;

  // Contagem de Relatos Em Andamento
  let emAndamentoQuery = supabase
    .from('relatos')
    .select('id', { count: 'exact' })
    .eq('status', 'APROVADO')
    .not('planejamento_cronologia_solucao', 'is', null)
    .is('data_conclusao_solucao', null);
  if (startDate && endDate) {
    emAndamentoQuery = emAndamentoQuery.gte('data_ocorrencia', startDate).lte('data_ocorrencia', endDate);
  }
  const { count: emAndamento, error: errorEmAndamento } = await emAndamentoQuery;

  if (errorEmAndamento) throw errorEmAndamento;

  // Contagem de Relatos Sem Tratativa
  let semTratativaQuery = supabase
    .from('relatos')
    .select('id', { count: 'exact' })
    .eq('status', 'APROVADO')
    .is('planejamento_cronologia_solucao', null)
    .is('data_conclusao_solucao', null);
  if (startDate && endDate) {
    semTratativaQuery = semTratativaQuery.gte('data_ocorrencia', startDate).lte('data_ocorrencia', endDate);
  }
  const { count: semTratativa, error: errorSemTratativa } = await semTratativaQuery;

  if (errorSemTratativa) throw errorSemTratativa;

  // Contagem de Relatos Pendentes de Aprovação
  let pendenteAprovacaoQuery = supabase
    .from('relatos')
    .select('id', { count: 'exact' })
    .eq('status', 'PENDENTE');
  if (startDate && endDate) {
    pendenteAprovacaoQuery = pendenteAprovacaoQuery.gte('data_ocorrencia', startDate).lte('data_ocorrencia', endDate);
  }
  const { count: pendenteAprovacao, error: errorPendenteAprovacao } = await pendenteAprovacaoQuery;

  if (errorPendenteAprovacao) throw errorPendenteAprovacao;

  // Contagem de Relatos Atribuídos ao Usuário Logado (excluindo concluídos)
  let relatosAtribuidos = 0;
  if (user) {
    let assignedRelatosQuery = supabase
      .from('relato_responsaveis')
      .select('relato_id!inner(id, data_conclusao_solucao, data_ocorrencia)', { count: 'exact' })
      .eq('user_id', user.id)
      .is('relato_id.data_conclusao_solucao', null);
    if (startDate && endDate) {
      assignedRelatosQuery = assignedRelatosQuery.gte('relato_id.data_ocorrencia', startDate).lte('relato_id.data_ocorrencia', endDate);
    }
    const { count, error } = await assignedRelatosQuery;

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
