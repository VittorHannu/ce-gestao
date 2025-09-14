import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClassificationCategories,
  updateClassificationCategoryOrder,
} from '../services/classificationService';
import { useToast } from '../../01-shared/hooks/useToast';

export const useClassificationCategories = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: categories,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['classification_categories'],
    queryFn: getClassificationCategories,
  });

  const updateOrderMutation = useMutation({
    mutationFn: updateClassificationCategoryOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['classification_categories']);
      toast({
        title: 'Sucesso',
        description: 'Ordem das categorias atualizada com sucesso.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Não foi possível atualizar a ordem: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    categories,
    isLoading,
    isError,
    updateOrderMutation,
  };
};
