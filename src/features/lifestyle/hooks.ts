import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lifestyleApi, LifestyleLog } from './api';

export function useLifestyleData(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['lifestyle', startDate, endDate],
    queryFn: () => lifestyleApi.fetchByDateRange(startDate, endDate),
  });
}

export function useLogLifestyle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (log: Omit<LifestyleLog, 'id'>) => lifestyleApi.upsert(log),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifestyle'] });
    },
  });
}
