import { Plus, Minus, ArrowUpRight, RotateCcw } from 'lucide-react';

interface ScratchpadProps {
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  onChangeName: (name: string) => void;
  onUpdateMacro: (macro: 'protein' | 'carbs' | 'fat', delta: number) => void;
  onSetMacro: (macro: 'protein' | 'carbs' | 'fat', value: number) => void; // 🔥 New direct set hook parameter
  onClear: () => void;
  onCommit: () => void;
  isPending: boolean;
}

export function Scratchpad({
  name, protein, carbs, fat,
  onChangeName, onUpdateMacro, onSetMacro, onClear, onCommit, isPending
}: ScratchpadProps) {
  const totalCalories = (protein * 4) + (carbs * 4) + (fat * 9);
  const isDirty = protein > 0 || carbs > 0 || fat > 0 || name !== '';

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] p-5 backdrop-blur-md space-y-4 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Quick Macro Log..."
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          className="bg-transparent font-semibold text-zinc-100 placeholder-zinc-600 outline-none text-sm w-2/3 border-b border-transparent focus:border-zinc-850 pb-0.5"
        />
        
        {isDirty && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] text-zinc-500 hover:text-zinc-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Grid containing high-fidelity numerical cell wrappers */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'protein' as const, label: 'Protein', val: protein, text: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/10 focus-within:border-emerald-500/40' },
          { key: 'carbs' as const, label: 'Carbs', val: carbs, text: 'text-cyan-400', bg: 'bg-cyan-500/5 border-cyan-500/10 focus-within:border-cyan-500/40' },
          { key: 'fat' as const, label: 'Fats', val: fat, text: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/10 focus-within:border-amber-500/40' },
        ].map((m) => (
          <div key={m.key} className={`rounded-xl border p-2 flex flex-col items-center justify-between min-h-[90px] transition-all ${m.bg}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{m.label}</span>
            
            {/* Inline Dynamic Numerical Input Block */}
            <div className="flex items-baseline justify-center w-full max-w-[65px] px-1">
              <input
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                value={m.val === 0 ? '' : m.val}
                placeholder="0"
                onChange={(e) => onSetMacro(m.key, parseInt(e.target.value) || 0)}
                className={`w-full text-center font-mono text-lg font-bold bg-transparent outline-none ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${m.text}`}
              />
              <span className="text-[10px] font-semibold text-zinc-600 ml-0.5 select-none">g</span>
            </div>

            {/* Granular 1g Incremental Step Controls */}
            <div className="flex items-center justify-between w-full gap-1 pt-1.5">
              <button
                type="button"
                onClick={() => onUpdateMacro(m.key, -1)} // 🔥 Ticks down by 1g
                className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-400 active:scale-75 transition-transform"
              >
                <Minus className="h-2.5 w-2.5" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateMacro(m.key, 1)} // 🔥 Ticks up by 1g
                className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-400 active:scale-75 transition-transform"
              >
                <Plus className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Commit Button */}
      <button
        type="button"
        disabled={totalCalories === 0 || isPending}
        onClick={onCommit}
        className="w-full flex h-11 items-center justify-between rounded-xl bg-emerald-500 text-zinc-950 px-4 text-xs font-bold shadow-lg shadow-emerald-500/10 transition-all hover:bg-emerald-400 disabled:opacity-20 disabled:pointer-events-none active:scale-[0.99]"
      >
        <span className="font-mono tracking-wide">{totalCalories} kcal calculated</span>
        <div className="flex items-center gap-1">
          <span>Log Entry</span>
          <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
        </div>
      </button>
    </div>
  );
}