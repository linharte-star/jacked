import { useWeightData } from '../weight/hooks';
import { useLiftingHistory } from '../lifting/hooks';
import { WeightChart } from '../weight/components/WeightChart';
import { LiftingCharts } from '../lifting/components/LiftingCharts';
import styles from './AnalyticsModule.module.css';

export function AnalyticsModule() {
  const { data: weights, isLoading: weightsLoading } = useWeightData();
  const { data: liftingHistory, isLoading: liftingLoading } = useLiftingHistory();

  if (weightsLoading || liftingLoading) {
    return (
      <div className="text-zinc-500 text-xs text-center py-12 font-mono">
        Aggregating performance data...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Analytics Dashboard</h3>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Body Weight Trend</h4>
        <WeightChart data={weights || []} />
      </div>

      <div className={styles.section}>
        <LiftingCharts history={liftingHistory || []} />
      </div>
    </div>
  );
}
