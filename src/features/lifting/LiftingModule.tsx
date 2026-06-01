import { useState } from 'react';
import { useLiftingHistory, useStrongLiftsEngine, useLogWorkout } from './hooks';
import { WorkoutSetup } from './components/WorkoutSetup';
import { ActiveWorkout } from './components/ActiveWorkout';
import { LiftingCharts } from './components/LiftingCharts';
import styles from './LiftingModule.module.css';

export function LiftingModule() {
  const { data: history, isLoading: historyLoading } = useLiftingHistory();
  const { data: engineSetup, isLoading: engineLoading } = useStrongLiftsEngine(history);
  const logWorkoutMutation = useLogWorkout();

  const [workoutIsActive, setWorkoutIsActive] = useState(
    () => localStorage.getItem('active_workout_session') !== null,
  );

  if (historyLoading || engineLoading) {
    return (
      <div className="text-zinc-500 text-xs text-center py-12 font-mono">
        Parsing historical lifting patterns...
      </div>
    );
  }

  const handleCancel = () => {
    if (confirm('Wipe current workout status? All active session data entries will be lost.')) {
      localStorage.removeItem('active_workout_session');
      setWorkoutIsActive(false);
    }
  };

  return (
    <div className={styles.container}>
      {workoutIsActive && engineSetup ? (
        <ActiveWorkout
          initialSession={engineSetup}
          onCancel={handleCancel}
          isSaving={logWorkoutMutation.isPending}
          onSave={(session) => {
            logWorkoutMutation.mutate(session, {
              onSuccess: () => setWorkoutIsActive(false),
            });
          }}
        />
      ) : (
        engineSetup && (
          <>
            {/* Top Component Section: Setup & Initialize Button */}
            <WorkoutSetup session={engineSetup} onStart={() => setWorkoutIsActive(true)} />

            {/* Visual Separation Divider */}
            <hr className={styles.divider} />

            {/* Bottom Component Section: Progression Charts visible on Scroll */}
            <LiftingCharts history={history || []} />
          </>
        )
      )}
    </div>
  );
}
