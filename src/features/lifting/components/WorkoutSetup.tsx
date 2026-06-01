import type { ActiveWorkoutSession } from '../types';
import { Play, Dumbbell } from 'lucide-react';
import styles from './WorkoutSetup.module.css';

interface WorkoutSetupProps {
  session: ActiveWorkoutSession;
  onStart: () => void;
}

export function WorkoutSetup({ session, onStart }: WorkoutSetupProps) {
  return (
    <div className={styles.container}>
      <div className={styles.heroCard}>
        <div className={styles.iconWrapper}>
          <Dumbbell className="h-6 w-6" />
        </div>
        <h2 className={styles.heroTitle}>StrongLifts 5x5 Matrix</h2>
        <p className={styles.heroDesc}>
          Next workout weights shown
        </p>
      </div>

      <div className={styles.sessionSection}>
        <h4 className={styles.sessionHeader}>Target for Session {session.workout_type}</h4>
        {session.exercises.map((ex) => (
          <div key={ex.exercise_name} className={styles.exerciseRow}>
            <span className={styles.exName}>{ex.exercise_name}</span>
            <span className={styles.exTarget}>{ex.target_weight} lbs <span className={styles.exSub}>x {ex.sets.length} sets</span></span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onStart}
        className={styles.startBtn}
      >
        <Play className="h-4 w-4 fill-current" />
        <span>Initialize Workout {session.workout_type}</span>
      </button>
    </div>
  );
}
