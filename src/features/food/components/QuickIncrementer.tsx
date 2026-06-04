import { Plus, Minus } from 'lucide-react';
import { Macro } from '../../../types/types';

interface QuickIncrementerProps {
  onIncrement: (macro: Macro, amount: number) => void;
}

export function QuickIncrementer({ onIncrement }: QuickIncrementerProps) {
  const macrosConfig = [
    {
      key: Macro.PROTEIN,
      label: 'Protein Add',
      color: 'border-emerald-500/10 text-emerald-400 bg-emerald-500/5',
    },
    {
      key: Macro.CARBS,
      label: 'Carbs Add',
      color: 'border-cyan-500/10 text-cyan-400 bg-cyan-500/5',
    },
    {
      key: Macro.FAT,
      label: 'Fat Add',
      color: 'border-amber-500/10 text-amber-400 bg-amber-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {macrosConfig.map((m) => (
        <div
          key={m.key}
          className={`rounded-xl border p-2 text-center space-y-2 flex flex-col items-center justify-between ${m.color}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{m.key}</span>
          <div className="flex w-full items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => onIncrement(m.key, -5)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950/60 border border-zinc-900 text-zinc-400 active:scale-75 transition-transform"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-xs font-bold font-mono text-zinc-100">+5g</span>
            <button
              type="button"
              onClick={() => onIncrement(m.key, 5)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950/60 border border-zinc-900 text-zinc-400 active:scale-75 transition-transform"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
