import { useState } from 'react';
import { useLogWeight } from '../hooks';
import { X } from 'lucide-react';

interface WeightLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WeightLogModal({ isOpen, onClose }: WeightLogModalProps) {
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const logWeightMutation = useLogWeight();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedWeight = parseFloat(weight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) return;

    logWeightMutation.mutate(
      { weight: parsedWeight, date },
      {
        onSuccess: () => {
          setWeight('');
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/60 backdrop-blur-sm sm:items-center p-4">
      <div className="w-full max-w-sm rounded-t-2xl border border-zinc-900 bg-zinc-900 p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200 sm:rounded-2xl">
        <div className="flex items-center justify-between pb-4">
          <h3 className="text-lg font-semibold text-zinc-50">Record Weight</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Weight (lbs / kg)</label>
            <input
              type="number"
              step="0.1"
              required
              autoFocus
              inputMode="decimal"
              placeholder="185.4"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 px-4 text-zinc-50 outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 px-4 text-zinc-50 outline-none focus:border-emerald-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={logWeightMutation.isPending}
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {logWeightMutation.isPending ? 'Saving...' : 'Save Data Entry'}
          </button>
        </form>
      </div>
    </div>
  );
}