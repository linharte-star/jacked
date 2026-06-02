import { supabase } from '../../lib/supabase';

export interface LifestyleLog {
  id?: number;
  date: string;
  coffee_cups: number;
  water_cups: number;
  bedtime: string | null; // ISO Timestamps handled as strings via JSON
  wake_time: string | null; // ISO Timestamps handled as strings via JSON
  sleep_quality: number | null;
  energy_level: number | null;
  completed_habits: string[]; // Tracks completed habit definition IDs
}

export interface HabitDefinition {
  id: number;
  label: string;
}

export const lifestyleApi = {
  async fetchByDateRange(startDate: string, endDate: string): Promise<LifestyleLog[]> {
    const { data, error } = await supabase
      .from('lifestyle_logs')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async upsert(log: Omit<LifestyleLog, 'id'>): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthenticated lifestyle mutation query');

    const { error } = await supabase
      .from('lifestyle_logs')
      .upsert({ user_id: user.id, ...log }, { onConflict: 'user_id, date' });

    if (error) throw new Error(error.message);
  },

  async fetchHabitDefinitions(): Promise<HabitDefinition[]> {
    const { data, error } = await supabase
      .from('habit_definitions')
      .select('id, label')
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async createHabitDefinition(label: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthenticated habit instantiation');

    const { error } = await supabase.from('habit_definitions').insert({ user_id: user.id, label });

    if (error) throw new Error(error.message);
  },

  async deleteHabitDefinition(id: number): Promise<void> {
    const { error } = await supabase.from('habit_definitions').delete().eq('id', id);

    if (error) throw new Error(error.message);
  },
};
