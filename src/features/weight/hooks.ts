import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { weightApi } from './api';

export function useWeightData() {
  return useQuery({
    queryKey: ['weights'],
    queryFn: weightApi.fetchAll,
  });
}

export function useLogWeight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ weight, date }: { weight: number; date: string }) =>
      weightApi.upsert(weight, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weights'] });
    },
  });
}
