import { MacroTargets } from '../api';
import styles from './MacroProgress.module.css';

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
    <div className={styles.card}>
      {/* Absolute Calorie Score Overview */}
      <div className={styles.summary}>
        <div>
          <h2 className={styles.summaryHeader}>Energy Summary</h2>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className={styles.summaryValue}>{totals.calories}</span>
            <span className={styles.summaryTarget}>/ {targets.target_calories} kcal</span>
          </div>
        </div>
        <div className="text-right">
          <span className={styles.remainingLabel}>Remaining</span>
          <span
            className={`${styles.remainingValue} ${remainingCals >= 0 ? styles.remainingPositive : styles.remainingNegative}`}
          >
            {remainingCals} kcal
          </span>
        </div>
      </div>

      {/* Structured Progress Trackers Matrix */}
      <div className={styles.trackList}>
        {/* Protein Progress Line */}
        <div className={styles.trackItem}>
          <div className={styles.trackHeader}>
            <span className={styles.trackLabel}>Protein</span>
            <span className={styles.trackStats}>
              {totals.protein}g{' '}
              <span className={styles.trackTarget}>/ {targets.target_protein}g</span>
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              style={{ width: `${calculatePercent(totals.protein, targets.target_protein)}%` }}
              className={`${styles.progressFill} ${styles.fillProtein}`}
            />
          </div>
        </div>

        {/* Carbs Progress Line */}
        <div className={styles.trackItem}>
          <div className={styles.trackHeader}>
            <span className={styles.trackLabel}>Carbohydrates</span>
            <span className={styles.trackStats}>
              {totals.carbs}g <span className={styles.trackTarget}>/ {targets.target_carbs}g</span>
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              style={{ width: `${calculatePercent(totals.carbs, targets.target_carbs)}%` }}
              className={`${styles.progressFill} ${styles.fillCarbs}`}
            />
          </div>
        </div>

        {/* Fat Progress Line */}
        <div className={styles.trackItem}>
          <div className={styles.trackHeader}>
            <span className={styles.trackLabel}>Dietary Fats</span>
            <span className={styles.trackStats}>
              {totals.fat}g <span className={styles.trackTarget}>/ {targets.target_fat}g</span>
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              style={{ width: `${calculatePercent(totals.fat, targets.target_fat)}%` }}
              className={`${styles.progressFill} ${styles.fillFat}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
