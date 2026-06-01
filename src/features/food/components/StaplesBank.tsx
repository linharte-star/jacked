import { useState } from 'react';
import { FoodStaple } from '../api';
import { Plus, BookmarkPlus, SlidersHorizontal, Trash2 } from 'lucide-react';

interface StaplesBankProps {
  staples: FoodStaple[];
  onSelectStaple: (staple: FoodStaple) => void;
  onCreateStaple: (staple: Omit<FoodStaple, 'id'>) => void;
  onDeleteStaple: (id: number) => void;
}

export function StaplesBank({ staples, onSelectStaple, onCreateStaple, onDeleteStaple }: StaplesBankProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [label, setLabel] = useState('');
  const [p, setP] = useState('');
  const [c, setC] = useState('');
  const [f, setF] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    onCreateStaple({
      label: label.trim(),
      protein: parseFloat(p) || 0,
      carbs: parseFloat(c) || 0,
      fat: parseFloat(f) || 0
    });

    setLabel(''); setP(''); setC(''); setF('');
    setIsOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pl-0.5">
        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Meal Staples Bank</h4>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setIsManageMode(!isManageMode); if (isOpen) setIsOpen(false); }}
            className={`text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer
              ${isManageMode ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-400'}`}
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>{isManageMode ? 'Done' : 'Manage'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setIsOpen(!isOpen); if (isManageMode) setIsManageMode(false); }}
            className="text-xs font-bold text-emerald-400 flex items-center gap-1 hover:text-emerald-300 cursor-pointer"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            <span>Create Preset</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <form onSubmit={handleCreate} className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/40 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <input
            type="text" required placeholder="Preset Label (e.g., Post-Workout Shake)" value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full text-xs font-semibold rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-200 outline-none focus:border-emerald-500/50"
          />
          <div className="grid grid-cols-3 gap-2">
            <input type="number" placeholder="P (g)" value={p} onChange={(e) => setP(e.target.value)} className="w-full text-center font-mono text-xs border border-zinc-800 bg-zinc-950 p-2 rounded-lg text-zinc-100 outline-none" />
            <input type="number" placeholder="C (g)" value={c} onChange={(e) => setC(e.target.value)} className="w-full text-center font-mono text-xs border border-zinc-800 bg-zinc-950 p-2 rounded-lg text-zinc-100 outline-none" />
            <input type="number" placeholder="F (g)" value={f} onChange={(e) => setF(e.target.value)} className="w-full text-center font-mono text-xs border border-zinc-800 bg-zinc-950 p-2 rounded-lg text-zinc-100 outline-none" />
          </div>
          <button type="submit" className="w-full rounded-xl bg-zinc-100 py-2 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-colors">
            Add Preset to Bank
          </button>
        </form>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        {staples.length === 0 ? (
          <span className="text-[11px] text-zinc-600 pl-0.5 py-1">No presets found.</span>
        ) : (
          staples.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={isManageMode && logInFlight}
              onClick={() => isManageMode ? onDeleteStaple(s.id) : onSelectStaple(s)}
              className={`shrink-0 flex items-center gap-2 border py-2 px-3 rounded-xl transition-all active:scale-95 text-left
                ${isManageMode 
                  ? 'border-amber-500/20 bg-amber-500/[0.02] text-amber-400 hover:bg-red-500/5 hover:border-red-500/30 hover:text-red-400' 
                  : 'border-zinc-900 bg-zinc-900/40 text-zinc-300'
                }`}
            >
              {isManageMode ? (
                <Trash2 className="h-3.5 w-3.5 text-amber-500 hover:text-red-400 shrink-0" />
              ) : (
                <Plus className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              )}
              <div>
                <p className="text-xs font-semibold leading-tight">{s.label}</p>
                <p className="text-[9px] font-mono font-medium text-zinc-500 pt-0.5">
                  {s.protein}P · {s.carbs}C · {s.fat}F
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
const logInFlight = false; // Internal design helper constant flag