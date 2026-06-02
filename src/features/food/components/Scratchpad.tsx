import { useState } from 'react';
import { Plus, Minus, ArrowUpRight, RotateCcw, Scale } from 'lucide-react';
import { FoodSearchAutocomplete } from './FoodSearchAutocomplete';
import { GlobalFood } from '../api';
import styles from './Scratchpad.module.css';

interface ScratchpadProps {
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  onChangeName: (name: string) => void;
  onUpdateMacro: (macro: 'protein' | 'carbs' | 'fat', delta: number) => void;
  onSetMacro: (macro: 'protein' | 'carbs' | 'fat', value: number) => void;
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

  const [activeBaseFood, setActiveBaseFood] = useState<GlobalFood | null>(null);
  const [weightGrams, setWeightGrams] = useState<number>(100);
  const [isRatioLocked, setIsRatioLocked] = useState<boolean>(true);

  // 🔥 Track state transitions directly during the render pass to eliminate effect warnings
  const isCurrentlyEmpty = !name && protein === 0 && carbs === 0 && fat === 0;
  const [prevEmpty, setPrevEmpty] = useState(isCurrentlyEmpty);

  if (isCurrentlyEmpty !== prevEmpty) {
    setPrevEmpty(isCurrentlyEmpty);
    if (isCurrentlyEmpty) {
      setActiveBaseFood(null);
      setWeightGrams(100);
      setIsRatioLocked(true);
    }
  }

  const handleSelectGlobalFood = (foodItem: GlobalFood) => {
    setActiveBaseFood(foodItem);
    setWeightGrams(100);
    setIsRatioLocked(true);
    onChangeName(foodItem.food);

    onSetMacro('protein', Math.round(foodItem.protein));
    onSetMacro('carbs', Math.round(foodItem.carbohydrates));
    onSetMacro('fat', Math.round(foodItem.fat));
  };

  const handleWeightChange = (targetGrams: number) => {
    const sanitizedGrams = Math.max(0, targetGrams);
    setWeightGrams(sanitizedGrams);

    if (activeBaseFood && isRatioLocked) {
      const multiplier = sanitizedGrams / 100;
      onSetMacro('protein', Math.round(activeBaseFood.protein * multiplier));
      onSetMacro('carbs', Math.round(activeBaseFood.carbohydrates * multiplier));
      onSetMacro('fat', Math.round(activeBaseFood.fat * multiplier));
    }
  };

  const handleStepWeight = (delta: number) => {
    handleWeightChange(weightGrams + delta);
  };

  const interceptSetMacro = (macro: 'protein' | 'carbs' | 'fat', value: number) => {
    if (activeBaseFood) setIsRatioLocked(false);
    onSetMacro(macro, value);
  };

  const interceptUpdateMacro = (macro: 'protein' | 'carbs' | 'fat', delta: number) => {
    if (activeBaseFood) setIsRatioLocked(false);
    onUpdateMacro(macro, delta);
  };

  return (
    <div className={styles.container}>
      <div className={styles.decoration} />

      <div className={styles.header}>
        <div className="flex-1">
          <FoodSearchAutocomplete
            value={name}
            onChangeName={onChangeName}
            onSelectFood={handleSelectGlobalFood}
          />
        </div>

        {isDirty && (
          <button type="button" onClick={onClear} className={styles.resetButton}>
            <RotateCcw className="h-2.5 w-2.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {activeBaseFood && (
        <div className={styles.weightRow}>
          <div className={styles.weightLabelSide}>
            <Scale className={styles.scaleIcon} />
            <span className={styles.weightText}>Amount</span>
          </div>

          <div className={styles.weightControlSide}>
            <button
              type="button"
              onClick={() => handleStepWeight(-10)}
              className={styles.weightStepBtn}
            >
              <Minus className="h-3 w-3" />
            </button>

            <div className={styles.weightInputGroup}>
              <input
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                value={weightGrams === 0 ? '' : weightGrams}
                placeholder="0"
                onChange={(e) => handleWeightChange(parseInt(e.target.value) || 0)}
                className={styles.weightInput}
              />
              <span className={styles.weightUnit}>g</span>
            </div>

            <button
              type="button"
              onClick={() => handleStepWeight(10)}
              className={styles.weightStepBtn}
            >
              <Plus className="h-3 w-3" />
            </button>

            <button
              type="button"
              onClick={() => setIsRatioLocked(!isRatioLocked)}
              className={`${styles.lockBadge} ${isRatioLocked ? styles.lockActive : styles.lockOverridden}`}
            >
              {isRatioLocked ? 'Locked' : 'Manual'}
            </button>
          </div>
        </div>
      )}

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

            <div className={styles.inputBlock}>
              <input
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                value={m.val === 0 ? '' : m.val}
                placeholder="0"
                onChange={(e) => interceptSetMacro(m.key, parseInt(e.target.value) || 0)}
                className={`${styles.macroInput} ${m.inputClass}`}
              />
              <span className={styles.unit}>g</span>
            </div>

            <div className={styles.controlRow}>
              <button
                type="button"
                onClick={() => interceptUpdateMacro(m.key, -1)}
                className={styles.controlBtn}
              >
                <Minus className="h-2.5 w-2.5" />
              </button>
              <button
                type="button"
                onClick={() => interceptUpdateMacro(m.key, 1)}
                className={styles.controlBtn}
              >
                <Plus className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

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
