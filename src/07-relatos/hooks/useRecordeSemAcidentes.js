import { useQuery } from '@tanstack/react-query';
import { getAccidentRecordStats } from '../services/relatoStatsService';

export function useRecordeSemAcidentes() {
  return useQuery({
    queryKey: ['accidentRecordStats'],
    queryFn: getAccidentRecordStats
  });
}
