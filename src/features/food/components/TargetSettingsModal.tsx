import { useState, useEffect } from 'react';
import { MacroTargets } from '../api';
import { X, Save } from 'lucide-react';
import styles from './TargetSettingsModal.module.css';

interface TargetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTargets: MacroTargets;
  onSave: (targets: MacroTargets) => void;
  isSaving: boolean;
}

export function TargetSettingsModal({ isOpen, onClose, currentTargets, onSave, isSaving }: TargetSettingsModalProps) {
  const [calories, setCalories] = useState(currentTargets.target_calories.toString());
  const [protein, setProtein] = useState(currentTargets.target_protein.toString());
  const [carbs, setCarbs] = useState(currentTargets.target_carbs.toString());
  const [fat, setFat] = useState(currentTargets.target_fat.toString());

  // Sync internal state if external targets update upstream
  useEffect(() => {
    if (isOpen) {
      setCalories(currentTargets.target_calories.toString());
      setProtein(currentTargets.target_protein.toString());
      setCarbs(currentTargets.target_carbs.toString());
      setFat(currentTargets.target_fat.toString());
    }
  }, [isOpen, currentTargets]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      target_calories: parseInt(calories) || 2000,
      target_protein: parseInt(protein) || 150,
      target_carbs: parseInt(carbs) || 200,
      target_fat: parseInt(fat) || 70,
    });
    onClose();
  };

  const autoCalculateCalories = () => {
    const p = parseInt(protein) || 0;
    const c = parseInt(carbs) || 0;
    const f = parseInt(fat) || 0;
    setCalories(((p * 4) + (c * 4) + (f * 9)).toString());
  };

  return (
    <div className={styles.overlay}>
      {/* Backdrop blur effect */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Modal View Surface Box */}
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Target Parameters</h3>
            <p className={styles.subtitle}>Configure your daily macronutrient thresholds.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Calories (kcal)</label>
              <div className={styles.inputWrapper}>
                <input
                  type="number" inputMode="numeric" value={calories} onChange={(e) => setCalories(e.target.value)}
                  className={styles.input}
                />
                <button
                  type="button" onClick={autoCalculateCalories}
                  className={styles.autoBtn}
                >
                  Auto
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Protein (g)</label>
              <input
                type="number" inputMode="numeric" value={protein} onChange={(e) => setProtein(e.target.value)}
                className={styles.basicInput}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Carbs (g)</label>
              <input
                type="number" inputMode="numeric" value={carbs} onChange={(e) => setCarbs(e.target.value)}
                className={styles.basicInput}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Fat (g)</label>
              <input
                type="number" inputMode="numeric" value={fat} onChange={(e) => setFat(e.target.value)}
                className={styles.basicInput}
              />
            </div>
          </div>

          <button
            type="submit" disabled={isSaving}
            className={styles.submitBtn}
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Updating Profiles...' : 'Save Parameters'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
