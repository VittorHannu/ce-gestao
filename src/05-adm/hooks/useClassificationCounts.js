import { useQuery } from '@tanstack/react-query';
import { getAllClassificationCounts } from '../services/classificationService';

export const useClassificationCounts = () => {
  return useQuery({
    queryKey: ['classificationCounts'],
    queryFn: getAllClassificationCounts
  });
};
