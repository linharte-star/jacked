import type { ActiveSet } from '../types';
import { Check } from 'lucide-react';

interface SetCircleProps {
  set: ActiveSet;
  onToggle: () => void;
}

export function SetCircle({ set, onToggle }: SetCircleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex h-12 w-12 flex-col items-center justify-center rounded-full border text-sm font-semibold transition-all duration-150 active:scale-90
        ${!set.is_completed 
          ? 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700' 
          : set.logged_reps === 5 
            ? 'border-emerald-500 bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/10' 
            : 'border-amber-500 bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/10'
        }`}
    >
      {set.is_completed ? (
        set.logged_reps === 5 ? <Check className="h-5 w-5 stroke-[3]" /> : <span>{set.logged_reps}</span>
      ) : (
        <span>5</span>
      )}
    </button>
  );
}