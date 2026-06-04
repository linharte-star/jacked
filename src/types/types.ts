export const AppTab = {
  DASHBOARD: 'dashboard',
  LIFTING: 'lifting',
  FOOD: 'food',
  ANALYTICS: 'analytics',
} as const;
export type AppTab = (typeof AppTab)[keyof typeof AppTab];

export const Macro = {
  PROTEIN: 'protein',
  CARBS: 'carbs',
  FAT: 'fat',
} as const;
export type Macro = (typeof Macro)[keyof typeof Macro];

export const WorkoutType = {
  A: 'A',
  B: 'B',
} as const;
export type WorkoutType = (typeof WorkoutType)[keyof typeof WorkoutType];

export const Timeframe = {
  SIX_MONTHS: '6M',
  ONE_YEAR: '1Y',
  ALL: 'ALL',
} as const;
export type Timeframe = (typeof Timeframe)[keyof typeof Timeframe];

export const SleepTimeType = {
  BED: 'bed',
  WAKE: 'wake',
} as const;
export type SleepTimeType = (typeof SleepTimeType)[keyof typeof SleepTimeType];
