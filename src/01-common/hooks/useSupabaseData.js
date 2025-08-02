



/*
 * Este hook React personalizado (`useSupabaseData`) é uma ferramenta poderosa
 * para buscar e gerenciar dados do Supabase em seu aplicativo.
 * Ele integra o React Query para cache de dados e a funcionalidade de tempo real (realtime) do Supabase.
 *
 * Visualmente no seu site, este hook não é visível diretamente. No entanto, ele é fundamental
 * para o funcionamento de todas as páginas que exibem dados dinâmicos do seu banco de dados.
 * Ele é responsável por:
 * - Carregar as informações que preenchem listas, tabelas e outros elementos visuais.
 * - Manter esses dados atualizados em tempo real, refletindo mudanças no banco de dados
 *   sem a necessidade de recarregar a página.
 * - Gerenciar o estado de carregamento e erro das requisições de dados.
 *
 *
 *
 *
 */



import { useState, useEffect } from 'react';
import { supabase } from '@/01-common/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useSupabaseData = (tableName, fetchDataFunction, initialFilters = {}, options = {}) => {
  const { keepPreviousData = true } = options;
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState(initialFilters);

  const {
    data,
    isLoading: loading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: [tableName, filters],
    queryFn: async () => {
      const { data: fetchedData, error: fetchError } = await fetchDataFunction(filters);
      if (fetchError) throw fetchError;
      return fetchedData || [];
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: keepPreviousData
  });

  useEffect(() => {
    const channel = supabase
      .channel(`public:${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, _payload => {
        // Invalida o cache da query para esta tabela, forçando um refetch
        queryClient.invalidateQueries({ queryKey: [tableName] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, queryClient]);

  const handleFiltersChange = (newFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  return { data, loading, error, filters, handleFiltersChange, refetch, isFetching };
};
