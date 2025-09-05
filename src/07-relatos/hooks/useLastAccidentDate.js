import { useQuery } from '@tanstack/react-query';
import { getLastLostTimeAccidentDate } from '../services/relatoStatsService';

export function useLastAccidentDate() {
  return useQuery({
    queryKey: ['lastAccidentDate'],
    queryFn: getLastLostTimeAccidentDate
  });
}
