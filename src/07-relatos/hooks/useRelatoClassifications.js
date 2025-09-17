import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllClassificationsGrouped,
  getRelatoClassifications,
  updateRelatoClassifications
} from '../services/relatoClassificationService';

/**
 * Hook to manage classifications for a relato.
 * @param {string} relatoId - The ID of the relato.
 */
export const useRelatoClassifications = (relatoId) => {
  const queryClient = useQueryClient();

  // Query to fetch all possible classifications, grouped by category
  const { data: allClassifications = [], isLoading: isLoadingAll, isError: isErrorAll } = useQuery({
    queryKey: ['allClassificationsGrouped'],
    queryFn: getAllClassificationsGrouped,
    staleTime: Infinity // This data is static, so it never becomes stale
  });

  // Query to fetch the currently selected classifications for the given relato
  const { data: selectedClassifications = [], isLoading: isLoadingSelected, isError: isErrorSelected } = useQuery({
    queryKey: ['relatoClassifications', relatoId],
    queryFn: () => getRelatoClassifications(relatoId),
    enabled: !!relatoId // Only run if relatoId is available
  });

  // Mutation to update the classifications for the relato
  const updateMutation = useMutation({
    mutationFn: (classifications) => updateRelatoClassifications(relatoId, classifications),
    onSuccess: () => {
      // Invalidate and refetch the selected classifications after an update
      queryClient.invalidateQueries({ queryKey: ['relatoClassifications', relatoId] });
    }
  });

  return {
    allClassifications,
    isLoadingAll,
    isErrorAll,
    selectedClassifications,
    isLoadingSelected,
    isErrorSelected,
    updateMutation
  };
};
