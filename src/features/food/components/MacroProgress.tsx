import { MacroTargets } from '../api';

interface MacroProgressProps {
  targets: MacroTargets;
  totals: { calories: number; protein: number; carbs: number; fat: number };
}

export function MacroProgress({ targets, totals }: MacroProgressProps) {
  const calculatePercent = (current: number, target: number) => {
    return Math.min(100, Math.max(0, (current / target) * 100));
  };

  const remainingCals = targets.target_calories - totals.calories;

  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-5 backdrop-blur-md space-y-5">
      {/* Absolute Calorie Score Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-zinc-400">Energy Summary</h2>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="text-3xl font-bold tracking-tight text-zinc-50">{totals.calories}</span>
            <span className="text-xs font-semibold text-zinc-500">/ {targets.target_calories} kcal</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Remaining</span>
          <span className={`text-sm font-bold font-mono ${remainingCals >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {remainingCals} kcal
          </span>
        </div>
      </div>

      {/* Structured Progress Trackers Matrix */}
      <div className="space-y-3.5">
        {/* Protein Progress Line */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-zinc-300">Protein</span>
            <span className="font-mono font-medium text-zinc-400">{totals.protein}g <span className="text-zinc-600">/ {targets.target_protein}g</span></span>
          </div>
          <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900/40">
            <div style={{ width: `${calculatePercent(totals.protein, targets.target_protein)}%` }} className="h-full bg-emerald-500 rounded-full transition-all duration-300" />
          </div>
        </div>

        {/* Carbs Progress Line */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-zinc-300">Carbohydrates</span>
            <span className="font-mono font-medium text-zinc-400">{totals.carbs}g <span className="text-zinc-600">/ {targets.target_carbs}g</span></span>
          </div>
          <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900/40">
            <div style={{ width: `${calculatePercent(totals.carbs, targets.target_carbs)}%` }} className="h-full bg-cyan-400 rounded-full transition-all duration-300" />
          </div>
        </div>

        {/* Fat Progress Line */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-zinc-300">Dietary Fats</span>
            <span className="font-mono font-medium text-zinc-400">{totals.fat}g <span className="text-zinc-600">/ {targets.target_fat}g</span></span>
          </div>
          <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900/40">
            <div style={{ width: `${calculatePercent(totals.fat, targets.target_fat)}%` }} className="h-full bg-amber-500 rounded-full transition-all duration-300" />
          </div>
        </div>
      </div>
    </div>
  );
}