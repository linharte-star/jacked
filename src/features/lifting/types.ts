import { WorkoutType } from '../../types/types';

export interface ActiveSet {
  sequence_order: number;
  target_reps: number; // Always 5
  logged_reps: number; // 0 to 5
  is_completed: boolean;
}

export interface ActiveExercise {
  exercise_name: string;
  target_weight: number;
  sets: ActiveSet[];
}

export interface ActiveWorkoutSession {
  workout_type: WorkoutType;
  date: string;
  exercises: ActiveExercise[];
}

export interface SetLog {
  id: number;
  reps: number;
  weight: string | number;
  sequence_order: number;
}

export interface WorkoutExerciseHistoryItem {
  id: number;
  exercise_name: string;
  sequence_order: number;
  set_logs: SetLog[];
}

export interface WorkoutHistoryItem {
  id: number;
  date: string;
  notes: string | null;
  workout_exercises: WorkoutExerciseHistoryItem[];
}
