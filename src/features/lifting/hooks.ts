import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { liftingApi } from './api';
import type {
  ActiveWorkoutSession,
  ActiveExercise,
  WorkoutHistoryItem,
  WorkoutExerciseHistoryItem,
  SetLog,
} from './types';

const DEFAULT_WEIGHTS: Record<string, number> = {
  Squat: 45,
  'Bench Press': 45,
  'Barbell Row': 65,
  'Overhead Press': 45,
  Deadlift: 135,
};

export function useLiftingHistory() {
  return useQuery({
    queryKey: ['liftingHistory'],
    queryFn: liftingApi.fetchHistory,
  });
}

export function useStrongLiftsEngine(history: WorkoutHistoryItem[] | undefined) {
  return useQuery({
    queryKey: ['nextWorkoutSetup', history?.length],
    enabled: !!history,
    queryFn: (): ActiveWorkoutSession => {
      if (!history || history.length === 0) {
        return generateEmptySession('A', DEFAULT_WEIGHTS);
      }

      // 1. Invert Workout Rotation
      const lastWorkoutNotes = history[0].notes || '';
      const nextType = lastWorkoutNotes.includes('Workout A') ? 'B' : 'A';

      // 2. Compute Progression State per Lift
      const targetWeights = { ...DEFAULT_WEIGHTS };
      const exercisesToCheck = [
        'Squat',
        'Bench Press',
        'Barbell Row',
        'Overhead Press',
        'Deadlift',
      ];

      exercisesToCheck.forEach((lift) => {
        // Find most recent occurrences of this specific exercise
        const relevantWorkouts = history.filter((w) =>
          w.workout_exercises.some((e: WorkoutExerciseHistoryItem) => e.exercise_name === lift),
        );

        if (relevantWorkouts.length > 0) {
          const lastValidWorkout = relevantWorkouts[0];
          const lastValidExercise = lastValidWorkout.workout_exercises.find(
            (e: WorkoutExerciseHistoryItem) => e.exercise_name === lift,
          )!;

          const lastWeight = parseFloat(
            lastValidExercise.set_logs[0]?.weight.toString() || DEFAULT_WEIGHTS[lift].toString(),
          );
          const totalTargetSets = lift === 'Deadlift' ? 1 : 5;

          const baseSuccess =
            lastValidExercise.set_logs.length >= totalTargetSets &&
            lastValidExercise.set_logs.every((s: SetLog) => s.reps === 5);

          if (baseSuccess) {
            targetWeights[lift] = lastWeight + (lift === 'Deadlift' ? 10 : 5);
          } else {
            // Check for 3 Consecutive Failures to trigger a 10% Deload
            let continuousFailures = 0;
            for (const w of relevantWorkouts) {
              const ex = w.workout_exercises.find(
                (e: WorkoutExerciseHistoryItem) => e.exercise_name === lift,
              );
              if (!ex) continue;
              const success =
                ex.set_logs.length >= totalTargetSets &&
                ex.set_logs.every((s: SetLog) => s.reps === 5);
              if (!success) continuousFailures++;
              else break;
            }

            if (continuousFailures >= 3) {
              targetWeights[lift] = Math.max(45, Math.round((lastWeight * 0.9) / 5) * 5);
            } else {
              targetWeights[lift] = lastWeight; // Retain current ceiling
            }
          }
        }
      });

      return generateEmptySession(nextType, targetWeights);
    },
  });
}

export function useLogWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (session: ActiveWorkoutSession) => liftingApi.saveWorkout(session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liftingHistory'] });
      localStorage.removeItem('active_workout_session');
    },
  });
}

function generateEmptySession(
  type: 'A' | 'B',
  weights: Record<string, number>,
): ActiveWorkoutSession {
  const lifts =
    type === 'A'
      ? ['Squat', 'Bench Press', 'Barbell Row']
      : ['Squat', 'Overhead Press', 'Deadlift'];

  const exercises: ActiveExercise[] = lifts.map((lift) => ({
    exercise_name: lift,
    target_weight: weights[lift],
    sets: Array.from({ length: lift === 'Deadlift' ? 1 : 5 }, (_, i) => ({
      sequence_order: i,
      target_reps: 5,
      logged_reps: 5,
      is_completed: false,
    })),
  }));

  return {
    workout_type: type,
    date: new Date().toLocaleDateString('sv'),
    exercises,
  };
}
