import { supabase } from '../../lib/supabase';

export interface WeightLog {
  id: number;
  weight: number;
  logged_at: string;
}

export const weightApi = {
  async fetchAll(): Promise<WeightLog[]> {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('id, weight, logged_at')
      .order('logged_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async upsert(weight: number, date: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthenticated operation rejected');

    const { error } = await supabase.from('weight_logs').upsert(
      {
        user_id: user.id,
        weight,
        logged_at: date,
      },
      {
        onConflict: 'user_id, logged_at',
      },
    );

    if (error) throw new Error(error.message);
  },
};
