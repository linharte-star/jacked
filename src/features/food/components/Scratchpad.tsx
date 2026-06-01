import { Plus, Minus, ArrowUpRight, RotateCcw } from 'lucide-react';
import styles from './Scratchpad.module.css';

interface ScratchpadProps {
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  onChangeName: (name: string) => void;
  onUpdateMacro: (macro: 'protein' | 'carbs' | 'fat', delta: number) => void;
  onSetMacro: (macro: 'protein' | 'carbs' | 'fat', value: number) => void; // 🔥 New direct set hook parameter
  onClear: () => void;
  onCommit: () => void;
  isPending: boolean;
}

export function Scratchpad({
  name,
  protein,
  carbs,
  fat,
  onChangeName,
  onUpdateMacro,
  onSetMacro,
  onClear,
  onCommit,
  isPending,
}: ScratchpadProps) {
  const totalCalories = protein * 4 + carbs * 4 + fat * 9;
  const isDirty = protein > 0 || carbs > 0 || fat > 0 || name !== '';

  return (
    <div className={styles.container}>
      <div className={styles.decoration} />

      <div className={styles.header}>
        <input
          type="text"
          placeholder="Quick Macro Log..."
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          className={styles.nameInput}
        />

        {isDirty && (
          <button type="button" onClick={onClear} className={styles.resetButton}>
            <RotateCcw className="h-2.5 w-2.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Grid containing high-fidelity numerical cell wrappers */}
      <div className={styles.grid}>
        {[
          {
            key: 'protein' as const,
            label: 'Protein',
            val: protein,
            inputClass: styles.inputProtein,
            cardClass: styles.cardProtein,
          },
          {
            key: 'carbs' as const,
            label: 'Carbs',
            val: carbs,
            inputClass: styles.inputCarbs,
            cardClass: styles.cardCarbs,
          },
          {
            key: 'fat' as const,
            label: 'Fats',
            val: fat,
            inputClass: styles.inputFat,
            cardClass: styles.cardFat,
          },
        ].map((m) => (
          <div key={m.key} className={`${styles.macroCard} ${m.cardClass}`}>
            <span className={styles.macroLabel}>{m.label}</span>

            {/* Inline Dynamic Numerical Input Block */}
            <div className={styles.inputBlock}>
              <input
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                value={m.val === 0 ? '' : m.val}
                placeholder="0"
                onChange={(e) => onSetMacro(m.key, parseInt(e.target.value) || 0)}
                className={`${styles.macroInput} ${m.inputClass}`}
              />
              <span className={styles.unit}>g</span>
            </div>

            {/* Granular 1g Incremental Step Controls */}
            <div className={styles.controlRow}>
              <button
                type="button"
                onClick={() => onUpdateMacro(m.key, -1)} // 🔥 Ticks down by 1g
                className={styles.controlBtn}
              >
                <Minus className="h-2.5 w-2.5" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateMacro(m.key, 1)} // 🔥 Ticks up by 1g
                className={styles.controlBtn}
              >
                <Plus className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Commit Button */}
      <button
        type="button"
        disabled={totalCalories === 0 || isPending}
        onClick={onCommit}
        className={styles.commitBtn}
      >
        <span className={styles.commitKcal}>{totalCalories} kcal calculated</span>
        <div className="flex items-center gap-1">
          <span>Log Entry</span>
          <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
        </div>
      </button>
    </div>
  );
}
