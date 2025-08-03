import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/01-common/lib/supabase';

const fetchRelatoCounts = async () => {
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

  return {
    totalAprovados,
    concluidos,
    emAndamento,
    semTratativa,
    pendenteAprovacao
  };
};

export const useRelatoCounts = () => {
  return useQuery({ queryKey: ['relatoCounts'], queryFn: fetchRelatoCounts });
};
