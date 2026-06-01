import { useEffect, useState } from 'react';
import type { ActiveWorkoutSession } from '../types';
import { ExerciseCard } from './ExerciseCard';
import { Save, Trash2, Timer } from 'lucide-react';

interface ActiveWorkoutProps {
  initialSession: ActiveWorkoutSession;
  onCancel: () => void;
  onSave: (session: ActiveWorkoutSession) => void;
  isSaving: boolean;
}

export function ActiveWorkout({ initialSession, onCancel, onSave, isSaving }: ActiveWorkoutProps) {
  const [session, setSession] = useState<ActiveWorkoutSession>(() => {
    const cached = localStorage.getItem('active_workout_session');
    return cached ? JSON.parse(cached) : initialSession;
  });

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    localStorage.setItem('active_workout_session', JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpdateWeight = (exIdx: number, newWeight: number) => {
  setSession(prev => {
    const nextEx = [...prev.exercises];
    nextEx[exIdx] = {
      ...nextEx[exIdx],
      target_weight: newWeight
    };
    return { ...prev, exercises: nextEx };
  });
};

  const handleToggleSet = (exIdx: number, setIdx: number) => {
    setSession(prev => {
      const nextEx = [...prev.exercises];
      const targetSet = { ...nextEx[exIdx].sets[setIdx] };

      if (!targetSet.is_completed) {
        targetSet.is_completed = true;
        targetSet.logged_reps = 5;
      } else if (targetSet.logged_reps > 0) {
        targetSet.logged_reps -= 1;
      } else {
        targetSet.is_completed = false;
        targetSet.logged_reps = 5;
      }

      nextEx[exIdx] = { ...nextEx[exIdx], sets: nextEx[exIdx].sets.map((s, i) => i === setIdx ? targetSet : s) };
      return { ...prev, exercises: nextEx };
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Absolute Header Sticky Diagnostics Bar */}
      <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 py-2 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Timer className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span className="font-mono text-sm font-medium">{formatTime(seconds)}</span>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-md">
          Workout {session.workout_type} Active
        </span>
      </div>

      {/* Primary Exercise Map Matrix */}
      <div className="space-y-4">
        {session.exercises.map((ex, exIdx) => (
          <ExerciseCard
            key={ex.exercise_name}
            exercise={ex}
            onUpdateSet={(setIdx) => handleToggleSet(exIdx, setIdx)}
            onUpdateWeight={(newWeight) => handleUpdateWeight(exIdx, newWeight)}
          />
        ))}
      </div>

      {/* Lower Termination Control Options */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-900 bg-zinc-950 px-4 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/5 active:scale-95"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => onSave(session)}
          className="flex-1 flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/10 transition-all hover:bg-emerald-400 disabled:opacity-50 active:scale-[0.98]"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Storing Lifts...' : 'Log Workout Completed'}</span>
        </button>
      </div>
    </div>
  );
}