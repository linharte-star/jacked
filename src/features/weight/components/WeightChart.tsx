import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { WeightLog } from '../api';

type Timeframe = '3M' | '6M' | '1Y' | 'ALL';

interface WeightChartProps {
  data: WeightLog[];
}

export function WeightChart({ data }: WeightChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('6M');

  const processedData = useMemo(() => {
    // 1. Calculate 7-Day Moving Average for Trendline
    const enriched = data.map((item, index) => {
      const start = Math.max(0, index - 6);
      const subset = data.slice(start, index + 1);
      const sum = subset.reduce((acc, curr) => acc + curr.weight, 0);
      const avg = sum / subset.length;

      return {
        ...item,
        formattedDate: new Date(
          item.logged_at + 'T00:00:00'
        ).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        }),
        trend: parseFloat(avg.toFixed(2)),
      };
    });

    // 2. Filter data entries based on chosen timeframe
    const cutoffDate = new Date();

    if (timeframe === '3M') {
      cutoffDate.setMonth(cutoffDate.getMonth() - 3);
    } else if (timeframe === '6M') {
      cutoffDate.setMonth(cutoffDate.getMonth() - 6);
    } else if (timeframe === '1Y') {
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
    }

    if (timeframe === 'ALL') return enriched;

    return enriched.filter(
      (item) => new Date(item.logged_at + 'T00:00:00') >= cutoffDate
    );
  }, [data, timeframe]);

  // Compute boundaries dynamically so the chart isn't squashed down to 0
  const yDomain = useMemo(() => {
    if (processedData.length === 0) return [0, 100];

    const weights = processedData.map((d) => d.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);

    return [Math.floor(min - 4), Math.ceil(max + 4)];
  }, [processedData]);

  return (
    <div className="space-y-4">
      {/* Timeframe Toggles */}
      <div className="flex justify-center bg-zinc-900 p-1 rounded-xl gap-1">
        {(['3M', '6M', '1Y', 'ALL'] as Timeframe[]).map((t) => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              timeframe === t
                ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t === 'ALL'
              ? 'All Time'
              : t === '1Y'
              ? '1 Year'
              : t === '6M'
              ? '6 Months'
              : '3 Months'}
          </button>
        ))}
      </div>

      {/* Recharts Graphical Rendering Engine */}
      <div className="h-64 w-full rounded-2xl border border-zinc-900 bg-zinc-900/20 p-2">
        {processedData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500">
            No logs captured within this window
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={processedData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#18181b"
                vertical={false}
              />

              <XAxis
                dataKey="formattedDate"
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                domain={yDomain}
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  borderRadius: '12px',
                }}
                labelStyle={{
                  color: '#a1a1aa',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
                itemStyle={{ fontSize: '12px' }}
              />

              {/* Daily Raw Log Nodes */}
              <Line
                type="monotone"
                dataKey="weight"
                name="Weight"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 2, strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />

              {/* Processed Trendline Array */}
              <Line
                type="monotone"
                dataKey="trend"
                name="Trendline (7d)"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 4"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}