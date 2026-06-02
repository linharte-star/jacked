import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foodApi } from './api';

export function useFoodData() {
  const today = new Date().toLocaleDateString('sv');

  const targetsQuery = useQuery({ queryKey: ['macroTargets'], queryFn: foodApi.fetchTargets });
  const logsQuery = useQuery({
    queryKey: ['foodLogs', today],
    queryFn: () => foodApi.fetchTodayLogs(today),
  });
  const staplesQuery = useQuery({ queryKey: ['foodStaples'], queryFn: foodApi.fetchStaples });

  return {
    targets: targetsQuery.data,
    logs: logsQuery.data || [],
    staples: staplesQuery.data || [],
    isLoading: targetsQuery.isLoading || logsQuery.isLoading || staplesQuery.isLoading,
    error: targetsQuery.error || logsQuery.error || staplesQuery.error,
  };
}

export function useLogFood() {
  const queryClient = useQueryClient();
  const today = new Date().toLocaleDateString('sv');

  return useMutation({
    mutationFn: foodApi.logFoodItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodLogs', today] });
    },
  });
}

export function useDeleteFoodItem() {
  const queryClient = useQueryClient();
  const today = new Date().toLocaleDateString('sv');

  return useMutation({
    mutationFn: foodApi.deleteFoodLogItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodLogs', today] });
    },
  });
}

export function useManageStaples() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: foodApi.addStaplePreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodStaples'] });
    },
  });
}

export function useUpdateTargets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: foodApi.updateTargets,
    onSuccess: () => {
      // Instantly forces progress bars to snap to new target bounds
      queryClient.invalidateQueries({ queryKey: ['macroTargets'] });
    },
  });
}

export function useDeleteStaple() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: foodApi.deleteStaplePreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodStaples'] });
    },
  });
}
