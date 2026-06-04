import { useState } from 'react';
import {
  useLifestyleData,
  useLogLifestyle,
  useHabitDefinitions,
  useCreateHabit,
  useDeleteHabit,
} from '../hooks';
import {
  Coffee,
  Droplets,
  Moon,
  Zap,
  Plus,
  Minus,
  Clock,
  ChevronUp,
  ChevronDown,
  Circle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import styles from './LifestyleScorecard.module.css';
import { SleepTimeType } from '../../../types/types';

const formatIsoTo24h = (isoString: string | null): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const hrs = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  return `${hrs}:${mins}`;
};

export function LifestyleScorecard() {
  const today = new Date().toLocaleDateString('sv');

  // Custom Habit Definition & Mutation Queries
  const { data: habitDefinitions, isLoading: habitsLoading } = useHabitDefinitions();
  const createHabitMutation = useCreateHabit();
  const deleteHabitMutation = useDeleteHabit();

  const { data: logs, isLoading: logsLoading } = useLifestyleData(today, today);
  const logMutation = useLogLifestyle();

  // Local Presentation States
  const [newHabitLabel, setNewHabitLabel] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [coffee, setCoffee] = useState(0);
  const [water, setWater] = useState(0);
  const [bedtime24h, setBedtime24h] = useState('');
  const [wakeTime24h, setWakeTime24h] = useState('');
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [completedHabitIds, setCompletedHabitIds] = useState<string[]>([]);

  // Keep track of the last logs we synced with local state
  const [prevLogs, setPrevLogs] = useState(logs);

  if (logs !== prevLogs) {
    setPrevLogs(logs);
    if (logs && logs.length > 0) {
      const dayLog = logs[0];
      setCoffee(dayLog.coffee_cups);
      setWater(dayLog.water_cups);
      setBedtime24h(formatIsoTo24h(dayLog.bedtime));
      setWakeTime24h(formatIsoTo24h(dayLog.wake_time));
      setSleepQuality(dayLog.sleep_quality);
      setEnergyLevel(dayLog.energy_level);
      setCompletedHabitIds(dayLog.completed_habits || []);
    } else {
      // RESET STATE FOR NEW DAY
      setCoffee(0);
      setWater(0);
      setBedtime24h('');
      setWakeTime24h('');
      setSleepQuality(null);
      setEnergyLevel(null);
      setCompletedHabitIds([]);
    }
  }

  // Pure Time Calculation Layer
  const runSmartInference = (bedStr: string, wakeStr: string) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(bedStr) || !timeRegex.test(wakeStr)) {
      return { bedIso: null, wakeIso: null, duration: null };
    }

    const [bedH, bedM] = bedStr.split(':').map(Number);
    const [wakeH, wakeM] = wakeStr.split(':').map(Number);

    const wakeDate = new Date(today + 'T00:00:00');
    wakeDate.setHours(wakeH, wakeM, 0, 0);

    const bedDate = new Date(today + 'T00:00:00');
    if (bedH > wakeH || (bedH === wakeH && bedM > wakeM)) {
      bedDate.setDate(bedDate.getDate() - 1);
    }
    bedDate.setHours(bedH, bedM, 0, 0);

    const diffMs = wakeDate.getTime() - bedDate.getTime();
    const duration = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    return { bedIso: bedDate.toISOString(), wakeIso: wakeDate.toISOString(), duration };
  };

  // Safe time stepping utility (15 minute delta intervals)
  const calculateTimeStep = (
    currentTime: string,
    deltaMinutes: number,
    fallback: string,
  ): string => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const [hrs, mins] = timeRegex.test(currentTime)
      ? currentTime.split(':').map(Number)
      : fallback.split(':').map(Number);

    let totalMins = hrs * 60 + mins + deltaMinutes;

    if (totalMins < 0) totalMins += 1440;
    if (totalMins >= 1440) totalMins %= 1440;

    const newHrs = Math.floor(totalMins / 60)
      .toString()
      .padStart(2, '0');
    const newMins = (totalMins % 60).toString().padStart(2, '0');
    return `${newHrs}:${newMins}`;
  };

  // Deliberate Write Triggers
  const handleTimeBlur = () => {
    const { bedIso, wakeIso } = runSmartInference(bedtime24h, wakeTime24h);
    logMutation.mutate({
      date: today,
      coffee_cups: coffee,
      water_cups: water,
      bedtime: bedIso,
      wake_time: wakeIso,
      sleep_quality: sleepQuality,
      energy_level: energyLevel,
      completed_habits: completedHabitIds,
    });
  };

  const handleTimeStepClick = (type: SleepTimeType, delta: number) => {
    let targetBed = bedtime24h;
    let targetWake = wakeTime24h;

    if (type === SleepTimeType.BED) {
      const nextBed = calculateTimeStep(bedtime24h, delta, '22:00');
      setBedtime24h(nextBed);
      targetBed = nextBed;
    } else {
      const nextWake = calculateTimeStep(wakeTime24h, delta, '07:00');
      setWakeTime24h(nextWake);
      targetWake = nextWake;
    }

    const { bedIso, wakeIso } = runSmartInference(targetBed, targetWake);
    logMutation.mutate({
      date: today,
      coffee_cups: coffee,
      water_cups: water,
      bedtime: bedIso,
      wake_time: wakeIso,
      sleep_quality: sleepQuality,
      energy_level: energyLevel,
      completed_habits: completedHabitIds,
    });
  };

  const saveQuickMetric = (updates: {
    coffee?: number;
    water?: number;
    quality?: number | null;
    energy?: number | null;
    habitsList?: string[];
  }) => {
    const { bedIso, wakeIso } = runSmartInference(bedtime24h, wakeTime24h);
    logMutation.mutate({
      date: today,
      coffee_cups: updates.coffee !== undefined ? updates.coffee : coffee,
      water_cups: updates.water !== undefined ? updates.water : water,
      bedtime: bedIso,
      wake_time: wakeIso,
      sleep_quality: updates.quality !== undefined ? updates.quality : sleepQuality,
      energy_level: updates.energy !== undefined ? updates.energy : energyLevel,
      completed_habits: updates.habitsList !== undefined ? updates.habitsList : completedHabitIds,
    });
  };

  // Checklist Array Mutation Router
  const handleToggleHabit = (idString: string) => {
    const nextList = completedHabitIds.includes(idString)
      ? completedHabitIds.filter((id) => id !== idString)
      : [...completedHabitIds, idString];
    setCompletedHabitIds(nextList);
    saveQuickMetric({ habitsList: nextList });
  };

  const handleAddHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitLabel.trim()) return;
    createHabitMutation.mutate(newHabitLabel.trim(), {
      onSuccess: () => {
        setNewHabitLabel('');
        setIsAdding(false);
      },
    });
  };

  if (habitsLoading || logsLoading) {
    return (
      <div className="text-zinc-500 text-xs text-center py-12 font-mono">
        Opening check-in layout...
      </div>
    );
  }

  const hoursSlept = runSmartInference(bedtime24h, wakeTime24h).duration;

  return (
    <div className={styles.container}>
      {/* Dynamic Habit Tracker Checklist Section */}
      <div className={styles.checklistSection}>
        <div className={styles.checklistHeader}>
          <h4 className={styles.checklistTitle}>Custom Checklist</h4>
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className={styles.addHabitButton}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddHabitSubmit} className={styles.addHabitForm}>
            <input
              type="text"
              required
              placeholder="Habit name (e.g., Read 10 pages)"
              value={newHabitLabel}
              onChange={(e) => setNewHabitLabel(e.target.value)}
              className={styles.habitInput}
            />
            <button type="submit" className={styles.habitSubmitButton}>
              Save
            </button>
          </form>
        )}

        <div className={styles.habitList}>
          {habitDefinitions?.length === 0 ? (
            <p className={styles.emptyChecklist}>
              No items found. Tap &quot;Add Item&quot; to initialize habits.
            </p>
          ) : (
            habitDefinitions?.map((habit) => {
              const strId = habit.id.toString();
              const isChecked = completedHabitIds.includes(strId);
              return (
                <div key={habit.id} className={styles.habitItemRow}>
                  <button
                    type="button"
                    onClick={() => handleToggleHabit(strId)}
                    className={`${styles.habitToggleButton} ${
                      isChecked ? styles.habitToggleActive : styles.habitToggleInactive
                    }`}
                  >
                    <span
                      className={`${styles.habitText} ${isChecked ? styles.habitTextChecked : ''}`}
                    >
                      {habit.label}
                    </span>
                    {isChecked ? (
                      <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                    ) : (
                      <Circle className="h-4 w-4 text-zinc-800 stroke-[2]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Wipe "${habit.label}" from checklist library?`)) {
                        deleteHabitMutation.mutate(habit.id);
                      }
                    }}
                    className={styles.habitDeleteButton}
                    title="Delete item permanently"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <hr className="border-zinc-800/40 my-1" />

      {/* Vitals Engine Fields */}
      <h3 className={styles.title}>Daily Vitals</h3>

      {/* 1. Caffeine Intake */}
      <div className={styles.row}>
        <div className={styles.rowInfo}>
          <div className={`${styles.iconWrapper} ${styles.iconCoffee}`}>
            <Coffee className="h-4 w-4" />
          </div>
          <div>
            <p className={styles.rowTitle}>Caffeine Intake</p>
            <p className={styles.rowSubtitle}>Cups consumed</p>
          </div>
        </div>
        <div className={styles.controlGroup}>
          <button
            type="button"
            onClick={() => {
              if (coffee > 0) {
                setCoffee((c) => c - 1);
                saveQuickMetric({ coffee: coffee - 1 });
              }
            }}
            className={styles.controlButton}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className={styles.controlValue}>{coffee}</span>
          <button
            type="button"
            onClick={() => {
              setCoffee((c) => c + 1);
              saveQuickMetric({ coffee: coffee + 1 });
            }}
            className={styles.controlButton}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Fluid Hydration */}
      <div className={styles.row}>
        <div className={styles.rowInfo}>
          <div className={`${styles.iconWrapper} ${styles.iconWater}`}>
            <Droplets className="h-4 w-4" />
          </div>
          <div>
            <p className={styles.rowTitle}>Water</p>
            <p className={styles.rowSubtitle}>Cups logged</p>
          </div>
        </div>
        <div className={styles.controlGroup}>
          <button
            type="button"
            onClick={() => {
              if (water > 0) {
                setWater((w) => w - 1);
                saveQuickMetric({ water: water - 1 });
              }
            }}
            className={styles.controlButton}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className={styles.controlValue}>{water}</span>
          <button
            type="button"
            onClick={() => {
              setWater((w) => w + 1);
              saveQuickMetric({ water: water + 1 });
            }}
            className={styles.controlButton}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Sleep Timeline */}
      <div className={styles.sleepSection}>
        <div className={styles.sleepHeader}>
          <div className={styles.sleepTitleGroup}>
            <Moon className="h-3.5 w-3.5 text-indigo-400" />
            <span>Sleep Timeline</span>
          </div>
          {hoursSlept !== null && hoursSlept > 0 && (
            <div className={styles.durationBadge}>
              <Clock className="h-3 w-3" />
              <span>{hoursSlept} hrs tracked</span>
            </div>
          )}
        </div>

        <div className={styles.sleepGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Bedtime (24h)</label>
            <div className={`group ${styles.timeInputWrapper}`}>
              <input
                type="text"
                placeholder="22:30"
                maxLength={5}
                inputMode="numeric"
                value={bedtime24h}
                onChange={(e) => setBedtime24h(e.target.value)}
                onBlur={handleTimeBlur}
                className={styles.timeInput}
              />
              <div className={styles.stepperGroup}>
                <button
                  type="button"
                  onClick={() => handleTimeStepClick(SleepTimeType.BED, 15)}
                  className={styles.stepperButton}
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeStepClick(SleepTimeType.BED, -15)}
                  className={styles.stepperButton}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Wake Time (24h)</label>
            <div className={`group ${styles.timeInputWrapper}`}>
              <input
                type="text"
                placeholder="07:00"
                maxLength={5}
                inputMode="numeric"
                value={wakeTime24h}
                onChange={(e) => setWakeTime24h(e.target.value)}
                onBlur={handleTimeBlur}
                className={styles.timeInput}
              />
              <div className={styles.stepperGroup}>
                <button
                  type="button"
                  onClick={() => handleTimeStepClick(SleepTimeType.WAKE, 15)}
                  className={styles.stepperButton}
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeStepClick(SleepTimeType.WAKE, -15)}
                  className={styles.stepperButton}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sleep Quality */}
      <div className={styles.qualitySection}>
        <div className={styles.sleepTitleGroup}>
          <Moon className="h-3.5 w-3.5 text-indigo-400" />
          <span>Sleep Quality</span>
        </div>
        <div className={styles.ratingGroup}>
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                setSleepQuality(val);
                saveQuickMetric({ quality: val });
              }}
              className={`${styles.ratingButton} ${sleepQuality === val ? styles.qualityActive : styles.ratingInactive}`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Energy Level */}
      <div className={styles.energySection}>
        <div className={styles.sleepTitleGroup}>
          <Zap className="h-3.5 w-3.5 text-cyan-400" />
          <span>Energy Baseline</span>
        </div>
        <div className={styles.ratingGroup}>
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                setEnergyLevel(val);
                saveQuickMetric({ energy: val });
              }}
              className={`${styles.ratingButton} ${energyLevel === val ? styles.energyActive : styles.ratingInactive}`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
