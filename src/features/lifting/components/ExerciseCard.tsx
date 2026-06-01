import { useState } from 'react';
import type { ActiveExercise } from '../types';
import { SetCircle } from './SetCircle';
import styles from './ExerciseCard.module.css';

interface ExerciseCardProps {
  exercise: ActiveExercise;
  onUpdateSet: (setIndex: number) => void;
  onUpdateWeight: (weight: number) => void; // Added prop to pipe weight shifts upward
}

export function ExerciseCard({ exercise, onUpdateSet, onUpdateWeight }: ExerciseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [weightInput, setWeightInput] = useState(exercise.target_weight.toString());

  const handleBlur = () => {
    setIsEditing(false);
    const parsed = parseFloat(weightInput);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateWeight(parsed);
    } else {
      setWeightInput(exercise.target_weight.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur(); // Triggers handleBlur execution automatically
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{exercise.exercise_name}</h3>

        {/* Interactive Weight Matrix Toggle */}
        {isEditing ? (
          <div className={styles.editWrapper}>
            <input
              type="number"
              step="0.5"
              pattern="[0-9]*"
              inputMode="decimal"
              autoFocus
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={styles.weightInput}
            />
            <span className={styles.unit}>lbs</span>
          </div>
        ) : (
          <button type="button" onClick={() => setIsEditing(true)} className={styles.weightDisplay}>
            {exercise.target_weight} lbs
          </button>
        )}
      </div>

      <div className={styles.setGrid}>
        {exercise.sets.map((set, idx) => (
          <SetCircle key={idx} set={set} onToggle={() => onUpdateSet(idx)} />
        ))}
      </div>
    </div>
  );
}
