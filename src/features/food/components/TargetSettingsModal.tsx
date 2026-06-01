import { useState, useEffect } from 'react';
import { MacroTargets } from '../api';
import { X, Save } from 'lucide-react';

interface TargetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTargets: MacroTargets;
  onSave: (targets: MacroTargets) => void;
  isSaving: boolean;
}

export function TargetSettingsModal({ isOpen, onClose, currentTargets, onSave, isSaving }: TargetSettingsModalProps) {
  const [calories, setCalories] = useState(currentTargets.target_calories.toString());
  const [protein, setProtein] = useState(currentTargets.target_protein.toString());
  const [carbs, setCarbs] = useState(currentTargets.target_carbs.toString());
  const [fat, setFat] = useState(currentTargets.target_fat.toString());

  // Sync internal state if external targets update upstream
  useEffect(() => {
    if (isOpen) {
      setCalories(currentTargets.target_calories.toString());
      setProtein(currentTargets.target_protein.toString());
      setCarbs(currentTargets.target_carbs.toString());
      setFat(currentTargets.target_fat.toString());
    }
  }, [isOpen, currentTargets]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      target_calories: parseInt(calories) || 2000,
      target_protein: parseInt(protein) || 150,
      target_carbs: parseInt(carbs) || 200,
      target_fat: parseInt(fat) || 70,
    });
    onClose();
  };

  const autoCalculateCalories = () => {
    const p = parseInt(protein) || 0;
    const c = parseInt(carbs) || 0;
    const f = parseInt(fat) || 0;
    setCalories(((p * 4) + (c * 4) + (f * 9)).toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur effect */}
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal View Surface Box */}
      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-900 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 z-10">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="font-bold text-zinc-100 text-base">Target Parameters</h3>
            <p className="text-[11px] text-zinc-500">Configure your daily macronutrient thresholds.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Calories (kcal)</label>
              <div className="flex items-center bg-zinc-900/40 border border-zinc-900 rounded-xl px-3 focus-within:border-zinc-700">
                <input
                  type="number" inputMode="numeric" value={calories} onChange={(e) => setCalories(e.target.value)}
                  className="w-full text-sm font-bold font-mono bg-transparent py-2.5 text-zinc-200 outline-none"
                />
                <button
                  type="button" onClick={autoCalculateCalories}
                  className="text-[9px] font-bold uppercase tracking-wide text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded ml-1 shrink-0 active:scale-95"
                >
                  Auto
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Protein (g)</label>
              <input
                type="number" inputMode="numeric" value={protein} onChange={(e) => setProtein(e.target.value)}
                className="w-full text-sm font-bold font-mono rounded-xl border border-zinc-900 bg-zinc-900/40 px-3 py-2.5 text-zinc-200 outline-none focus:border-zinc-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Carbs (g)</label>
              <input
                type="number" inputMode="numeric" value={carbs} onChange={(e) => setCarbs(e.target.value)}
                className="w-full text-sm font-bold font-mono rounded-xl border border-zinc-900 bg-zinc-900/40 px-3 py-2.5 text-zinc-200 outline-none focus:border-zinc-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Fat (g)</label>
              <input
                type="number" inputMode="numeric" value={fat} onChange={(e) => setFat(e.target.value)}
                className="w-full text-sm font-bold font-mono rounded-xl border border-zinc-900 bg-zinc-900/40 px-3 py-2.5 text-zinc-200 outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          <button
            type="submit" disabled={isSaving}
            className="w-full flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/10 transition-all hover:bg-emerald-400 disabled:opacity-50 active:scale-[0.99]"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Updating Profiles...' : 'Save Parameters'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}