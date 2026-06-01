import { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { parseLiftHistoryForChart } from '../chartSelectors';

interface LiftingChartsProps {
  history: any[];
}

const EXERCISES = ['Squat', 'Bench Press', 'Barbell Row', 'Overhead Press', 'Deadlift'];

export function LiftingCharts({ history }: LiftingChartsProps) {
  const [selectedExercise, setSelectedExercise] = useState('Squat');

  const chartData = useMemo(() => {
    return parseLiftHistoryForChart(history, selectedExercise);
  }, [history, selectedExercise]);

  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];
    const weights = chartData.map((d) => d.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    return [Math.floor(min - 10 > 0 ? min - 10 : 0), Math.ceil(max + 10)];
  }, [chartData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-medium text-zinc-400">Strength Progression</h2>
        <p className="text-xs text-zinc-500"> Completed workouts</p>
      </div>

      {/* Horizontal Mobile Exercise Selector */}
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4">
        {EXERCISES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setSelectedExercise(ex)}
            className={`snap-center shrink-0 px-4 py-2 text-xs font-semibold rounded-xl transition-all border
              ${selectedExercise === ex
                ? 'bg-emerald-500 text-zinc-950 border-emerald-500 shadow-lg shadow-emerald-500/10'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800/60 hover:text-zinc-200'
              }`}
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Recharts Performance Visualizer Container */}
      <div className="h-64 w-full rounded-2xl border border-zinc-900 bg-zinc-900/20 p-2">
        {chartData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-4 space-y-1">
            <span className="text-xs font-medium text-zinc-400">No data points matching parameters</span>
            <span className="text-[10px] text-zinc-600 max-w-[200px]">
              Complete all working sets of {selectedExercise} with exactly 5 repetitions to log a tracking marker.
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
              <XAxis dataKey="formattedDate" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis domain={yDomain} stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                labelStyle={{ color: '#a1a1aa', fontSize: '11px', fontWeight: 600 }}
                itemStyle={{ fontSize: '12px', color: '#10b981' }}
                formatter={(value: any) => [`${value} lbs`, 'Completed Load']}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 0, fill: '#10b981' }}
                activeDot={{ r: 5, stroke: '#09090b', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Metrics Highlighting Stats Card */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-4">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Current Working Level</span>
            <p className="text-xl font-bold text-zinc-50">{chartData[chartData.length - 1].weight} <span className="text-xs font-normal text-zinc-500">lbs</span></p>
          </div>
          <div className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-4">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Historical Peak</span>
            <p className="text-xl font-bold text-emerald-400">
              {Math.max(...chartData.map((d) => d.weight))} <span className="text-xs font-normal text-zinc-500">lbs</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}