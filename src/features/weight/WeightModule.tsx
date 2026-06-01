import { useState } from 'react';
import { useWeightData } from './hooks';
import { WeightChart } from './components/WeightChart';
import { WeightLogModal } from './components/WeightLogModal';
import { Plus } from 'lucide-react';

export function WeightModule() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: weights, isLoading, error } = useWeightData();

  if (isLoading) return <div className="text-zinc-500 text-xs text-center py-12">Loading data...</div>;
  if (error) return <div className="text-red-400 text-xs text-center py-12">Error linking metrics: {error.message}</div>;

  const currentWeight = weights && weights.length > 0 ? weights[weights.length - 1].weight : null;

  return (
    <div className="space-y-6">
      {/* Top Quick-View Summary Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-zinc-400">Body Composition</h2>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight text-zinc-50">
              {currentWeight ? currentWeight : '--.-'}
            </span>
            <span className="text-xs font-medium text-zinc-500">{currentWeight ? 'lbs' : ''}</span>
          </div>
        </div>
        
        <button
          onClick={() => setModalOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-all hover:bg-emerald-500/20 active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Main Chart System */}
      <WeightChart data={weights || []} />

      {/* Overlay Modal Layer */}
      <WeightLogModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}