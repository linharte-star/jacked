import { useState, useEffect } from 'react';
import { useWeightData } from './hooks';
import { supabase } from '../../lib/supabase';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { LifestyleScorecard } from '../lifestyle/components/LifestyleScorecard';
import { Scale, CheckCircle2, RefreshCw } from 'lucide-react';

export function WeightModule() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  
  const { data: weights, isLoading, error } = useWeightData();
  const [weightInput, setWeightInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Extract today's raw logged entry if it exists in your timeline array
  const todayLog = weights?.find(w => w.logged_at === today);

  useEffect(() => {
    if (todayLog) {
      setWeightInput(todayLog.weight.toString());
    } else {
      setWeightInput('');
    }
  }, [todayLog]);

  // Inline dynamic weight submission engine
  const saveWeightMutation = useMutation({
    mutationFn: async (weightVal: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthenticated weight write request');

      const { error } = await supabase
        .from('weight_logs')
        .upsert(
          { user_id: user.id, logged_at: today, weight: weightVal },
          { onConflict: 'user_id, logged_at' }
        );

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weightData'] });
      setIsSaving(false);
    }
  });

  const handleWeightBlur = () => {
    const parsed = parseFloat(weightInput);
    if (!isNaN(parsed) && parsed > 0) {
      // Avoid redundant API spam calls if the value matches the current log
      if (todayLog && todayLog.weight === parsed) return;
      setIsSaving(true);
      saveWeightMutation.mutate(parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  if (isLoading) return <div className="text-zinc-500 text-xs text-center py-12 font-mono">Syncing central logging hub...</div>;
  if (error) return <div className="text-red-400 text-xs text-center py-12">Connection fault: {error.message}</div>;

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Command Center Section Header */}
      <div className="pl-0.5">
        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Daily Entry Workspace</h4>
      </div>

      {/* 2. Seamless Inline Weight Capture Card */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-4 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors
            ${todayLog ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-900 text-zinc-500'}`}
          >
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-200">Morning Weight</p>
            <p className="text-[10px] text-zinc-500">
              {todayLog ? 'Logged successfully for today' : 'Awaiting scale metrics entry...'}
            </p>
          </div>
        </div>

        <div className="relative flex items-center bg-zinc-950 border border-zinc-900 rounded-xl px-2.5 max-w-[120px] focus-within:border-zinc-800">
          <input
            type="number"
            step="0.1"
            pattern="[0-9]*"
            inputMode="decimal"
            placeholder="000.0"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            onBlur={handleWeightBlur}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-right font-mono text-sm font-bold text-zinc-100 outline-none pr-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-[10px] font-bold text-zinc-600 select-none pr-1">lbs</span>
          
          {/* Reactive Status Spinner/Icon Indicators inside the slot */}
          <div className="absolute left-2 text-zinc-600 pointer-events-none">
            {isSaving ? (
              <RefreshCw className="h-3 w-3 animate-spin text-emerald-400" />
            ) : todayLog ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            ) : null}
          </div>
        </div>
      </div>

      {/* 3. Daily Vitals Card (Caffeine, Water, Sleep Timeline, Qualitatives) */}
      <LifestyleScorecard />

    </div>
  );
}