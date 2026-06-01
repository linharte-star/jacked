import { useState } from 'react';
import { FoodStaple } from '../api';
import { Plus, BookmarkPlus, SlidersHorizontal, Trash2 } from 'lucide-react';
import styles from './StaplesBank.module.css';

interface StaplesBankProps {
  staples: FoodStaple[];
  onSelectStaple: (staple: FoodStaple) => void;
  onCreateStaple: (staple: Omit<FoodStaple, 'id'>) => void;
  onDeleteStaple: (id: number) => void;
}

export function StaplesBank({ staples, onSelectStaple, onCreateStaple, onDeleteStaple }: StaplesBankProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [label, setLabel] = useState('');
  const [p, setP] = useState('');
  const [c, setC] = useState('');
  const [f, setF] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    onCreateStaple({
      label: label.trim(),
      protein: parseFloat(p) || 0,
      carbs: parseFloat(c) || 0,
      fat: parseFloat(f) || 0
    });

    setLabel(''); setP(''); setC(''); setF('');
    setIsOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.headerText}>Meal Staples Bank</h4>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => { setIsManageMode(!isManageMode); if (isOpen) setIsOpen(false); }}
            className={`${styles.manageBtn} ${isManageMode ? styles.manageBtnActive : styles.manageBtnInactive}`}
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>{isManageMode ? 'Done' : 'Manage'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setIsOpen(!isOpen); if (isManageMode) setIsManageMode(false); }}
            className={styles.createBtn}
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            <span>Create Preset</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <form onSubmit={handleCreate} className={styles.form}>
          <input
            type="text" required placeholder="Preset Label (e.g., Post-Workout Shake)" value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={styles.labelInput}
          />
          <div className={styles.macroGrid}>
            <input type="number" placeholder="P (g)" value={p} onChange={(e) => setP(e.target.value)} className={styles.macroInput} />
            <input type="number" placeholder="C (g)" value={c} onChange={(e) => setC(e.target.value)} className={styles.macroInput} />
            <input type="number" placeholder="F (g)" value={f} onChange={(e) => setF(e.target.value)} className={styles.macroInput} />
          </div>
          <button type="submit" className={styles.submitBtn}>
            Add Preset to Bank
          </button>
        </form>
      )}

      <div className={styles.staplesRow}>
        {staples.length === 0 ? (
          <span className={styles.emptyState}>No presets found.</span>
        ) : (
          staples.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={isManageMode && logInFlight}
              onClick={() => isManageMode ? onDeleteStaple(s.id) : onSelectStaple(s)}
              className={`${styles.stapleBtn} ${isManageMode ? styles.stapleBtnManage : styles.stapleBtnRegular}`}
            >
              {isManageMode ? (
                <Trash2 className={styles.iconTrash} />
              ) : (
                <Plus className={styles.iconPlus} />
              )}
              <div>
                <p className={styles.stapleLabel}>{s.label}</p>
                <p className={styles.stapleMacros}>
                  {s.protein}P · {s.carbs}C · {s.fat}F
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
const logInFlight = false; // Internal design helper constant flag
