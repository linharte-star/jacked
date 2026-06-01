import type { ActiveSet } from '../types';
import styles from './SetCircle.module.css';

interface SetCircleProps {
  set: ActiveSet;
  onToggle: () => void;
}

export function SetCircle({ set, onToggle }: SetCircleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`${styles.circle} ${set.is_completed ? styles.active : styles.inactive}`}
    >
      {set.is_completed ? set.logged_reps : ''}
    </button>
  );
}
