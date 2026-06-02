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
import { parseLiftHistoryForChart } from '../chartSelectors';
import { WorkoutHistoryItem } from '../types';
import styles from './LiftingCharts.module.css';

interface LiftingChartsProps {
  history: WorkoutHistoryItem[];
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
    <div className={styles.container}>
      <div>
        <h2 className={styles.header}>Strength Progression</h2>
        <p className={styles.subtitle}>Historical Working Load (5x5)</p>
      </div>

      {/* Horizontal Mobile Exercise Selector */}
      <div className={styles.selector}>
        {EXERCISES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setSelectedExercise(ex)}
            className={`${styles.selectorBtn} ${selectedExercise === ex ? styles.selectorBtnActive : styles.selectorBtnInactive}`}
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Recharts Performance Visualizer Container */}
      <div className={styles.chartContainer}>
        {chartData.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyTitle}>No data points logged yet</span>
            <span className={styles.emptyDesc}>
              Complete all working sets of {selectedExercise} with exactly 5 repetitions to track
              progress.
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="formattedDate"
                stroke="#a1a1aa"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={yDomain}
                stroke="#a1a1aa"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#3f3f46',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
                }}
                labelStyle={{ color: '#f4f4f5', fontSize: '11px', fontWeight: 700 }}
                itemStyle={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}
                formatter={(value: string | number | undefined) => [
                  value ? `${value} lbs` : '0 lbs',
                  'Load',
                ]}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 0, fill: '#10b981' }}
                activeDot={{ r: 6, stroke: '#09090b', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Metrics Highlighting Stats Card */}
      {chartData.length > 0 && (
        <div className={styles.statsGrid}>
          <div className={styles.statsCard}>
            <span className={styles.statsLabel}>Current Working</span>
            <p className={styles.statsValue}>
              {chartData[chartData.length - 1].weight} <span className={styles.statsUnit}>lbs</span>
            </p>
          </div>
          <div className={styles.statsCard}>
            <span className={styles.statsLabel}>Historical Peak</span>
            <p className={styles.statsPeak}>
              {Math.max(...chartData.map((d) => d.weight))}{' '}
              <span className={styles.statsUnit}>lbs</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
