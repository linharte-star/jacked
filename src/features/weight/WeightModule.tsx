import { useState, useEffect } from 'react';
import { useWeightData } from './hooks';
import { useFoodData } from '../food/hooks';
import { useLiftingHistory, useStrongLiftsEngine } from '../lifting/hooks';
import { supabase } from '../../lib/supabase';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { LifestyleScorecard } from '../lifestyle/components/LifestyleScorecard';
import { MacroProgress } from '../food/components/MacroProgress';
import { Scale, CheckCircle2, RefreshCw, Dumbbell, ChevronRight } from 'lucide-react';
import styles from './WeightModule.module.css';

interface WeightModuleProps {
  onNavigateToLift?: () => void;
}

export function WeightModule({ onNavigateToLift }: WeightModuleProps) {
  const queryClient = useQueryClient();
  const today = new Date().toLocaleDateString('sv');

  // 1. Core Module Data Hooks
  const { data: weights, isLoading: weightLoading, error: weightError } = useWeightData();
  const { targets, logs: foodLogs, isLoading: foodLoading } = useFoodData();
  const { data: liftingHistory, isLoading: liftingLoading } = useLiftingHistory();
  const { data: nextWorkout, isLoading: engineLoading } = useStrongLiftsEngine(liftingHistory);

  const [weightInput, setWeightInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Extract today's raw logged entry if it exists in your timeline array
  const todayLog = weights?.find((w) => w.logged_at === today);

  useEffect(() => {
    if (todayLog) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWeightInput(todayLog.weight.toString());
    } else {
      setWeightInput('');
    }
  }, [todayLog]);

  // Derived Food Metrics
  const foodTotals = foodLogs.reduce(
    (acc, curr) => {
      acc.protein += curr.protein;
      acc.carbs += curr.carbs;
      acc.fat += curr.fat;
      acc.calories += curr.calories;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  // Inline dynamic weight submission engine
  const saveWeightMutation = useMutation({
    mutationFn: async (weightVal: number) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthenticated weight write request');

      const { error } = await supabase
        .from('weight_logs')
        .upsert(
          { user_id: user.id, logged_at: today, weight: weightVal },
          { onConflict: 'user_id, logged_at' },
        );

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weightData'] });
      setIsSaving(false);
    },
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

  if (weightLoading || foodLoading || liftingLoading || engineLoading) {
    return (
      <div className="text-zinc-500 text-xs text-center py-12 font-mono">
        Syncing fitness cockpit...
      </div>
    );
  }

  if (weightError || !targets) {
    return (
      <div className="text-red-400 text-xs text-center py-12">
        Connection fault syncing dashboard data.
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 1. Energy Summary Integration (High Priority) */}
      <MacroProgress targets={targets} totals={foodTotals} />

      {/* 2. Weight Capture Integration */}
      <div className={styles.section}>
        <div className={styles.header}>
          <h4 className={styles.headerText}>Daily Entry Workspace</h4>
        </div>

        <div className={styles.weightCard}>
          <div className={styles.cardInfo}>
            <div
              className={`${styles.iconWrapper} ${todayLog ? styles.iconWrapperActive : styles.iconWrapperInactive}`}
            >
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className={styles.cardTitle}>Morning Weight</p>
              <p className={styles.cardSubtitle}>
                {todayLog ? 'Logged successfully for today' : 'Awaiting scale metrics entry...'}
              </p>
            </div>
          </div>

          <div className={styles.inputGroup}>
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
              className={styles.weightInput}
            />
            <span className={styles.unitLabel}>lbs</span>

            <div className={styles.statusIndicator}>
              {isSaving ? (
                <RefreshCw className={`${styles.statusIcon} ${styles.loadingSpinner}`} />
              ) : todayLog ? (
                <CheckCircle2 className={`${styles.statusIcon} ${styles.successIcon}`} />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Next Workout Integration (Compact Banner) */}
      {nextWorkout && (
        <button type="button" onClick={onNavigateToLift} className={styles.workoutBanner}>
          <div className={styles.bannerInfo}>
            <div className={styles.bannerIcon}>
              <Dumbbell className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className={styles.bannerLabel}>Upcoming Session</p>
              <p className={styles.bannerValue}>Workout {nextWorkout.workout_type}</p>
            </div>
          </div>
          <div className={styles.bannerAction}>
            <ChevronRight className="h-4 w-4" />
          </div>
        </button>
      )}

      {/* 4. Daily Vitals (Lifestyle) */}
      <div className={styles.section}>
        <LifestyleScorecard />
      </div>
    </div>
  );
}
