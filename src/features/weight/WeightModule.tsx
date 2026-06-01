import { useState, useEffect } from 'react';
import { useWeightData } from './hooks';
import { supabase } from '../../lib/supabase';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { LifestyleScorecard } from '../lifestyle/components/LifestyleScorecard';
import { Scale, CheckCircle2, RefreshCw } from 'lucide-react';
import styles from './WeightModule.module.css';

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
    <div className={styles.container}>
      
      {/* 1. Command Center Section Header */}
      <div className={styles.header}>
        <h4 className={styles.headerText}>Daily Entry Workspace</h4>
      </div>

      {/* 2. Seamless Inline Weight Capture Card */}
      <div className={styles.weightCard}>
        <div className={styles.cardInfo}>
          <div className={`${styles.iconWrapper} ${todayLog ? styles.iconWrapperActive : styles.iconWrapperInactive}`}
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
          
          {/* Reactive Status Spinner/Icon Indicators inside the slot */}
          <div className={styles.statusIndicator}>
            {isSaving ? (
              <RefreshCw className={`${styles.statusIcon} ${styles.loadingSpinner}`} />
            ) : todayLog ? (
              <CheckCircle2 className={`${styles.statusIcon} ${styles.successIcon}`} />
            ) : null}
          </div>
        </div>
      </div>

      {/* 3. Daily Vitals Card (Caffeine, Water, Sleep Timeline, Qualitatives) */}
      <LifestyleScorecard />

    </div>
  );
}
