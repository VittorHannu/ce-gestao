import { useQuery } from '@tanstack/react-query';
import { getAccidentRecordStats } from '../services/relatoStatsService';

export function useLastAccidentDate() {
  return useQuery({
    queryKey: ['accidentRecordStats'], // Use the same queryKey to share data
    queryFn: getAccidentRecordStats,
    select: (data) => data?.[0]?.data_ultimo_acidente ?? null // Select only the date
  });
}
