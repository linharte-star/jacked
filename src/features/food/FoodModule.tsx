import { useState } from 'react';
import {
  useFoodData,
  useLogFood,
  useManageStaples,
  useDeleteFoodItem,
  useUpdateTargets,
  useDeleteStaple,
} from './hooks';
import { MacroProgress } from './components/MacroProgress';
import { Scratchpad } from './components/Scratchpad';
import { StaplesBank } from './components/StaplesBank';
import { TargetSettingsModal } from './components/TargetSettingsModal';
import { Trash2, Settings } from 'lucide-react';
import styles from './FoodModule.module.css';

export function FoodModule() {
  const { targets, logs, staples, isLoading, error } = useFoodData();
  const logFoodMutation = useLogFood();
  const manageStaplesMutation = useManageStaples();
  const deleteItemMutation = useDeleteFoodItem();
  const updateTargetsMutation = useUpdateTargets();
  const deleteStapleMutation = useDeleteStaple();

  const [modalOpen, setModalOpen] = useState(false);

  const [scratchName, setScratchName] = useState('');
  const [scratchProtein, setScratchProtein] = useState(0);
  const [scratchCarbs, setScratchCarbs] = useState(0);
  const [scratchFat, setScratchFat] = useState(0);

  if (isLoading)
    return (
      <div className="text-zinc-500 text-xs text-center py-12 font-mono">
        Loading macro ledger logs...
      </div>
    );
  if (error || !targets)
    return (
      <div className="text-red-400 text-xs text-center py-12">
        Failed mapping goals profile index.
      </div>
    );

  const totals = logs.reduce(
    (acc, curr) => {
      acc.protein += curr.protein;
      acc.carbs += curr.carbs;
      acc.fat += curr.fat;
      acc.calories += curr.calories;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const clearScratchpad = () => {
    setScratchName('');
    setScratchProtein(0);
    setScratchCarbs(0);
    setScratchFat(0);
  };

  // 🔥 Granular 1g stepper adjuster logic
  const handleUpdateMacro = (macro: 'protein' | 'carbs' | 'fat', delta: number) => {
    if (macro === 'protein') setScratchProtein((p) => Math.max(0, p + delta));
    if (macro === 'carbs') setScratchCarbs((c) => Math.max(0, c + delta));
    if (macro === 'fat') setScratchFat((f) => Math.max(0, f + delta));
  };

  // 🔥 Direct keypad keyboard absolute typewriter handler
  const handleSetMacro = (macro: 'protein' | 'carbs' | 'fat', value: number) => {
    const sanitizedVal = Math.max(0, value);
    if (macro === 'protein') setScratchProtein(sanitizedVal);
    if (macro === 'carbs') setScratchCarbs(sanitizedVal);
    if (macro === 'fat') setScratchFat(sanitizedVal);
  };

  const handleCommitLog = () => {
    const calculatedCals = scratchProtein * 4 + scratchCarbs * 4 + scratchFat * 9;

    logFoodMutation.mutate(
      {
        food_name: scratchName.trim() || 'Quick Macro Entry',
        protein: scratchProtein,
        carbs: scratchCarbs,
        fat: scratchFat,
        calories: calculatedCals,
      },
      {
        onSuccess: () => clearScratchpad(),
      },
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.header}>
          <h4 className={styles.headerText}>Daily Dashboard</h4>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className={styles.editTargetsButton}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Edit Targets</span>
          </button>
        </div>
        <MacroProgress targets={targets} totals={totals} />
      </div>

      {/* Interactive Staging Sandbox Workbench */}
      <Scratchpad
        name={scratchName}
        protein={scratchProtein}
        carbs={scratchCarbs}
        fat={scratchFat}
        onChangeName={setScratchName}
        onUpdateMacro={handleUpdateMacro}
        onSetMacro={handleSetMacro}
        onClear={clearScratchpad}
        onCommit={handleCommitLog}
        isPending={logFoodMutation.isPending}
      />

      <StaplesBank
        staples={staples}
        onSelectStaple={(s) => {
          setScratchName(s.label);
          setScratchProtein(s.protein);
          setScratchCarbs(s.carbs);
          setScratchFat(s.fat);
        }}
        onCreateStaple={(newStaple) => manageStaplesMutation.mutate(newStaple)}
        onDeleteStaple={(id) => {
          if (confirm('Permanently delete this preset shortcut from your bank?')) {
            deleteStapleMutation.mutate(id);
          }
        }}
      />

      <div className={styles.section}>
        <h4 className={styles.ledgerHeader}>Today&apos;s Log Ledger</h4>
        <div className={styles.ledgerList}>
          {logs.length === 0 ? (
            <div className={styles.emptyLedger}>No entries accounted for today.</div>
          ) : (
            [...logs].reverse().map((item) => (
              <div key={item.id} className={styles.ledgerItem}>
                <div>
                  <p className={styles.itemTitle}>{item.food_name}</p>
                  <p className={styles.itemMacros}>
                    {item.protein}g P · {item.carbs}g C · {item.fat}g F
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={styles.itemCalories}>{item.calories} kcal</span>
                  <button
                    type="button"
                    onClick={() => deleteItemMutation.mutate(item.id)}
                    className={styles.deleteButton}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <TargetSettingsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentTargets={targets}
        onSave={(newTargets) => updateTargetsMutation.mutate(newTargets)}
        isSaving={updateTargetsMutation.isPending}
      />
    </div>
  );
}
