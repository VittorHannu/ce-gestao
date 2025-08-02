import { getRelatosStats } from '@/07-relatos/services/relatosService';
import { useSupabaseData } from '@/01-common/hooks/useSupabaseData';

export const useRelatosStats = () => {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    isFetching: statsIsFetching
  } = useSupabaseData('relatos_stats', getRelatosStats);

  return {
    stats,
    statsLoading,
    statsError,
    statsIsFetching
  };
};
