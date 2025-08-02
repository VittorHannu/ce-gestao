import { useCallback } from 'react';
import { getRelatos, getRelatoById, saveRelato, deleteRelato } from '@/07-relatos/services/relatosService';
import { useSupabaseData } from '@/01-common/hooks/useSupabaseData';
import { useQueryClient, useQuery } from '@tanstack/react-query';

export const useRelatos = (initialFilters = {}) => {
  const queryClient = useQueryClient();

  const {
    data: relatos,
    loading,
    error,
    filters,
    handleFiltersChange: setFilters,
    isFetching
  } = useSupabaseData('relatos_with_creator', getRelatos, initialFilters, { keepPreviousData: false });

  const addRelato = useCallback(async (relatoData, userId, isAdmin) => {
    try {
      const { data, error: saveError } = await saveRelato(relatoData, null, userId, isAdmin);
      if (saveError) throw saveError;
      queryClient.invalidateQueries({ queryKey: ['relatos_with_creator'] });
      queryClient.invalidateQueries({ queryKey: ['relatos_stats'] });
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }, [queryClient]);

  const updateRelato = useCallback(async (relatoData, relatoId, userId, isAdmin) => {
    try {
      const { data, error: saveError } = await saveRelato(relatoData, relatoId, userId, isAdmin);
      if (saveError) throw saveError;
      queryClient.invalidateQueries({ queryKey: ['relatos_with_creator'] });
      queryClient.invalidateQueries({ queryKey: ['relatos_stats'] });
      queryClient.invalidateQueries({ queryKey: ['relatos_with_creator', { id: relatoId }] });
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }, [queryClient]);

  const removeRelato = useCallback(async (relatoId, userId) => {
    try {
      const { success, error: deleteError } = await deleteRelato(relatoId, userId);
      if (deleteError) throw deleteError;
      queryClient.invalidateQueries({ queryKey: ['relatos_with_creator'] });
      queryClient.invalidateQueries({ queryKey: ['relatos_stats'] });
      return { success, error: null };
    } catch (err) {
      console.error('Erro ao remover relato:', err);
      return { success: false, error: err };
    }
  }, [queryClient]);

  const getSingleRelatoData = useCallback(async (relatoId) => {
    try {
      const { data, error } = await getRelatoById(relatoId);
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao buscar relato único:', err);
      throw err;
    }
  }, []);

  return {
    relatos,
    loading,
    error,
    filters,
    setFilters,
    addRelato,
    updateRelato,
    removeRelato,
    isFetching,
    useRelatoDetails: (relatoId) => useQuery({
      queryKey: ['relatos_with_creator', { id: relatoId }],
      queryFn: () => getSingleRelatoData(relatoId),
      enabled: !!relatoId
    })
  };
};
