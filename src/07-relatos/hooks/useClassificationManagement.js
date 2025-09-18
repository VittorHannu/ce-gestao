import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCategoryClassifications } from '../services/classificationService';

export const useClassificationManagement = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ relatoId, categoryId, classificationIds }) => 
      updateCategoryClassifications(relatoId, categoryId, classificationIds),
    onSuccess: (data, variables) => {
      // Invalidate and refetch the classifications for the specific relato
      queryClient.invalidateQueries({ queryKey: ['relatoClassifications', variables.relatoId] });
    },
  });

  return {
    updateCategoryClassifications: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
};
