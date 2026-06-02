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

export function useHabitDefinitions() {
  return useQuery({
    queryKey: ['habitDefinitions'],
    queryFn: lifestyleApi.fetchHabitDefinitions,
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lifestyleApi.createHabitDefinition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitDefinitions'] });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lifestyleApi.deleteHabitDefinition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitDefinitions'] });
      // Invalidate current logs to remove deleted habits from completion arrays
      queryClient.invalidateQueries({ queryKey: ['lifestyle'] });
    },
  });
}
