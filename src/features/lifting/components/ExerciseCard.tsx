import { useState } from 'react';
import type { ActiveExercise } from '../types';
import { SetCircle } from './SetCircle';

interface ExerciseCardProps {
  exercise: ActiveExercise;
  onUpdateSet: (setIndex: number) => void;
  onUpdateWeight: (weight: number) => void; // Added prop to pipe weight shifts upward
}

export function ExerciseCard({ exercise, onUpdateSet, onUpdateWeight }: ExerciseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [weightInput, setWeightInput] = useState(exercise.target_weight.toString());

  const handleBlur = () => {
    setIsEditing(false);
    const parsed = parseFloat(weightInput);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateWeight(parsed);
    } else {
      setWeightInput(exercise.target_weight.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur(); // Triggers handleBlur execution automatically
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between pb-4 h-9">
        <h3 className="font-semibold text-zinc-100">{exercise.exercise_name}</h3>
        
        {/* Interactive Weight Matrix Toggle */}
        {isEditing ? (
          <div className="flex items-center gap-1 bg-zinc-950 rounded-lg px-2 py-1 border border-emerald-500/50 max-w-[100px]">
            <input
              type="number"
              step="0.5"
              pattern="[0-9]*"
              inputMode="decimal"
              autoFocus
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-right text-sm font-bold text-emerald-400 outline-none pr-0.5"
            />
            <span className="text-xs font-semibold text-zinc-500">lbs</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10 transition-all active:scale-95 hover:bg-emerald-500/10 cursor-pointer"
          >
            {exercise.target_weight} lbs
          </button>
        )}
      </div>
      
      <div className="flex items-center justify-between gap-2 px-1">
        {exercise.sets.map((set, idx) => (
          <SetCircle key={idx} set={set} onToggle={() => onUpdateSet(idx)} />
        ))}
      </div>
    </div>
  );
}