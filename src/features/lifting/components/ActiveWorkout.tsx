import { useEffect, useState } from 'react';
import type { ActiveWorkoutSession } from '../types';
import { ExerciseCard } from './ExerciseCard';
import { Save, Trash2, Timer } from 'lucide-react';
import styles from './ActiveWorkout.module.css';

interface ActiveWorkoutProps {
  initialSession: ActiveWorkoutSession;
  onCancel: () => void;
  onSave: (session: ActiveWorkoutSession) => void;
  isSaving: boolean;
}

export function ActiveWorkout({ initialSession, onCancel, onSave, isSaving }: ActiveWorkoutProps) {
  const [session, setSession] = useState<ActiveWorkoutSession>(() => {
    const cached = localStorage.getItem('active_workout_session');
    return cached ? JSON.parse(cached) : initialSession;
  });

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    localStorage.setItem('active_workout_session', JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpdateWeight = (exIdx: number, newWeight: number) => {
  setSession(prev => {
    const nextEx = [...prev.exercises];
    nextEx[exIdx] = {
      ...nextEx[exIdx],
      target_weight: newWeight
    };
    return { ...prev, exercises: nextEx };
  });
};

  const handleToggleSet = (exIdx: number, setIdx: number) => {
    setSession(prev => {
      const nextEx = [...prev.exercises];
      const targetSet = { ...nextEx[exIdx].sets[setIdx] };

      if (!targetSet.is_completed) {
        targetSet.is_completed = true;
        targetSet.logged_reps = 5;
      } else if (targetSet.logged_reps > 0) {
        targetSet.logged_reps -= 1;
      } else {
        targetSet.is_completed = false;
        targetSet.logged_reps = 5;
      }

      nextEx[exIdx] = { ...nextEx[exIdx], sets: nextEx[exIdx].sets.map((s, i) => i === setIdx ? targetSet : s) };
      return { ...prev, exercises: nextEx };
    });
  };

  return (
    <div className={styles.container}>
      {/* Absolute Header Sticky Diagnostics Bar */}
      <div className={styles.stickyHeader}>
        <div className={styles.timerGroup}>
          <Timer className={styles.timerIcon} />
          <span className={styles.timerText}>{formatTime(seconds)}</span>
        </div>
        <span className={styles.statusBadge}>
          Workout {session.workout_type} Active
        </span>
      </div>

      {/* Primary Exercise Map Matrix */}
      <div className={styles.exerciseList}>
        {session.exercises.map((ex, exIdx) => (
          <ExerciseCard
            key={ex.exercise_name}
            exercise={ex}
            onUpdateSet={(setIdx) => handleToggleSet(exIdx, setIdx)}
            onUpdateWeight={(newWeight) => handleUpdateWeight(exIdx, newWeight)}
          />
        ))}
      </div>

      {/* Lower Termination Control Options */}
      <div className={styles.actionRow}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelBtn}
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => onSave(session)}
          className={styles.saveBtn}
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Storing Lifts...' : 'Complete Workout'}</span>
        </button>
      </div>
    </div>
  );
}
