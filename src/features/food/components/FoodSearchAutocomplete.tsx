import { useState, useEffect, useRef } from 'react';
import { useSearchGlobalFoods } from '../hooks';
import { Search, Loader2, Utensils } from 'lucide-react';
import { GlobalFood } from '../api';
import styles from './FoodSearchAutocomplete.module.css';

interface FoodSearchAutocompleteProps {
  value: string;
  onChangeName: (name: string) => void;
  onSelectFood: (foodItem: GlobalFood) => void;
}

export function FoodSearchAutocomplete({
  value,
  onChangeName,
  onSelectFood,
}: FoodSearchAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setSearchTerm(value);
    setPrevValue(value);
  }

  // Handle typing bounce calculations
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 200);

    return () => clearTimeout(delayTimer);
  }, [searchTerm]);

  const { data: results, isLoading } = useSearchGlobalFoods(debouncedTerm);

  // Close drop list on external blur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: GlobalFood) => {
    onSelectFood(item);
    setSearchTerm(item.food);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={styles.autocompleteContainer}>
      <div className={styles.inputWrapper}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search 5,000+ foods (e.g. egg, potato)..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onChangeName(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={styles.searchInput}
        />
        {isLoading && <Loader2 className={styles.spinnerIcon} />}
      </div>

      {isOpen && debouncedTerm.trim().length >= 2 && (
        <div className={styles.dropdownOverlay}>
          {results?.length === 0 ? (
            <div className={styles.statusMessage}>No exact whole matches found.</div>
          ) : (
            results?.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className={styles.dropdownItemButton}
              >
                <div className={styles.itemMetaGroup}>
                  <Utensils className={styles.itemIcon} />
                  <span className={styles.itemNameText}>{item.food}</span>
                </div>
                <span className={styles.itemCaloriesBadge}>
                  {Math.round(item.caloric_value)} kcal{' '}
                  <span className={styles.perUnitText}>/100g</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
