export interface ActiveSet {
  sequence_order: number;
  target_reps: number;   // Always 5
  logged_reps: number;   // 0 to 5
  is_completed: boolean; 
}

export interface ActiveExercise {
  exercise_name: string;
  target_weight: number;
  sets: ActiveSet[];
}

export interface ActiveWorkoutSession {
  workout_type: 'A' | 'B';
  date: string;
  exercises: ActiveExercise[];
}