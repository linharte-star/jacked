import { WorkoutHistoryItem, WorkoutExerciseHistoryItem, SetLog } from './types';

export interface LiftChartPoint {
  date: string;
  formattedDate: string;
  weight: number;
}

export function parseLiftHistoryForChart(
  history: WorkoutHistoryItem[],
  exerciseName: string,
): LiftChartPoint[] {
  if (!history) return [];

  const points: LiftChartPoint[] = [];

  // Process from oldest to newest to build a chronological timeline
  const chronologicalHistory = [...history].reverse();

  chronologicalHistory.forEach((workout) => {
    const exercise = workout.workout_exercises?.find(
      (e: WorkoutExerciseHistoryItem) => e.exercise_name === exerciseName,
    );

    if (!exercise || !exercise.set_logs || exercise.set_logs.length === 0) return;

    const targetSetsCount = exerciseName === 'Deadlift' ? 1 : 5;
    const sets = exercise.set_logs;

    // A workout is strictly COMPLETED if all sets reached exactly 5 reps
    const isCompleted = sets.length >= targetSetsCount && sets.every((s: SetLog) => s.reps === 5);

    if (isCompleted) {
      const weight =
        typeof sets[0].weight === 'string' ? parseFloat(sets[0].weight) : sets[0].weight;

      // Handle same-day double logging by updating to the highest weight entry
      const existingPointIdx = points.findIndex((p) => p.date === workout.date);
      if (existingPointIdx !== -1) {
        if (weight > points[existingPointIdx].weight) {
          points[existingPointIdx].weight = weight;
        }
      } else {
        points.push({
          date: workout.date,
          formattedDate: new Date(workout.date + 'T00:00:00').toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
          }),
          weight,
        });
      }
    }
  });

  return points;
}
