import { supabase } from '../../lib/supabase';
import type { ActiveWorkoutSession } from './types';

export const liftingApi = {
async fetchHistory() {
  const { data, error } = await supabase
    .from('workout_logs')
    .select(`
      id,
      date,
      notes,
      workout_exercises (
        id,
        exercise_name,
        sequence_order,
        set_logs (
          id,
          weight,
          reps,
          sequence_order
        )
      )
    `)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false }); // 🔥 FIX: Ties are broken by the exact timestamp of creation

  if (error) throw new Error(error.message);
  return data || [];
},

  async saveWorkout(session: ActiveWorkoutSession): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthenticated write operation');

    // 1. Insert Top-Level Workout Container
    const { data: workout, error: wError } = await supabase
      .from('workout_logs')
      .insert({ 
        user_id: user.id, 
        date: session.date, 
        notes: `StrongLifts 5x5 - Workout ${session.workout_type}` 
      })
      .select('id')
      .single();

    if (wError) throw new Error(wError.message);

    // 2. Insert Exercises and Children Sets sequentially
    for (let i = 0; i < session.exercises.length; i++) {
      const ex = session.exercises[i];
      const { data: exercise, error: exError } = await supabase
        .from('workout_exercises')
        .insert({ 
          workout_id: workout.id, 
          exercise_name: ex.exercise_name, 
          sequence_order: i 
        })
        .select('id')
        .single();

      if (exError) throw new Error(exError.message);

      const setsToInsert = ex.sets.map((s) => ({
        exercise_id: exercise.id,
        weight: ex.target_weight,
        reps: s.is_completed ? s.logged_reps : 0,
        is_warmup: false,
        sequence_order: s.sequence_order,
      }));

      const { error: setsError } = await supabase
        .from('set_logs')
        .insert(setsToInsert);

      if (setsError) throw new Error(setsError.message);
    }
  }
};