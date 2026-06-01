import type { ActiveWorkoutSession } from '../types';
import { Play, Dumbbell } from 'lucide-react';

interface WorkoutSetupProps {
  session: ActiveWorkoutSession;
  onStart: () => void;
}

export function WorkoutSetup({ session, onStart }: WorkoutSetupProps) {
  return (
    <div className="space-y-6 pt-2">
      <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          <Dumbbell className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-100">StrongLifts 5x5 Matrix</h2>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto">
          Next workout weights shown
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pl-1">Target for Session {session.workout_type}</h4>
        {session.exercises.map((ex) => (
          <div key={ex.exercise_name} className="flex items-center justify-between rounded-xl border border-zinc-900 bg-zinc-900/40 p-4">
            <span className="text-sm font-medium text-zinc-200">{ex.exercise_name}</span>
            <span className="text-sm font-bold text-zinc-50">{ex.target_weight} lbs <span className="text-xs font-normal text-zinc-500">x {ex.sets.length} sets</span></span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onStart}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/10 transition-all hover:bg-emerald-400 active:scale-[0.99]"
      >
        <Play className="h-4 w-4 fill-current" />
        <span>Initialize Workout {session.workout_type}</span>
      </button>
    </div>
  );
}