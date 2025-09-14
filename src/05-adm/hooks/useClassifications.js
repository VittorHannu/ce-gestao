import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClassifications,
  addClassification,
  updateClassification,
  deleteClassification,
  updateClassificationOrder
} from '../services/classificationService';

/**
 * Custom hook to manage classifications for a specific table.
 * @param {string} tableName - The name of the classification table (e.g., 'classificacao_riscos').
 */
export const useClassifications = (tableName) => {
  const queryClient = useQueryClient();

  // Query to fetch all classifications for the given table
  const { data: classifications = [], isLoading, isError } = useQuery({
    queryKey: ['classifications', tableName],
    queryFn: () => getClassifications(tableName),
    enabled: !!tableName // Only run the query if tableName is provided
  });

  // Mutation to add a new classification
  const addMutation = useMutation({
    mutationFn: (newItem) => addClassification(tableName, newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classifications', tableName] });
    }
  });

  // Mutation to update a classification
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => updateClassification(tableName, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classifications', tableName] });
    }
  });

  // Mutation to delete a classification
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteClassification(tableName, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classifications', tableName] });
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ tableName, items }) => updateClassificationOrder(tableName, items),
    onSuccess: (_, { tableName }) => {
      queryClient.invalidateQueries({ queryKey: ['classifications', tableName] });
    },
    onError: (error) => {
      // TODO: Handle error
      console.error('Error updating order:', error);
    }
  });

  return {
    classifications,
    isLoading,
    isError,
    addMutation,
    updateMutation,
    deleteMutation,
    updateOrderMutation
  };
};
