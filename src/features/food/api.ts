import { supabase } from '../../lib/supabase';

export interface FoodLogItem {
  id: number;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
}

export interface FoodStaple {
  id: number;
  label: string;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MacroTargets {
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
}

export const foodApi = {
  async fetchTargets(): Promise<MacroTargets> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthenticated targets check');

    const { data, error } = await supabase
      .from('profiles')
      .select('target_calories, target_protein, target_carbs, target_fat')
      .eq('id', user.id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async fetchTodayLogs(date: string): Promise<FoodLogItem[]> {
    const { data, error } = await supabase.from('food_logs').select('*').eq('date', date);

    if (error) throw new Error(error.message);
    return (data || []).map((item) => ({
      ...item,
      protein: Number(item.protein),
      carbs: Number(item.carbs),
      fat: Number(item.fat),
    }));
  },

  async fetchStaples(): Promise<FoodStaple[]> {
    const { data, error } = await supabase
      .from('food_staples')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((item) => ({
      ...item,
      protein: Number(item.protein),
      carbs: Number(item.carbs),
      fat: Number(item.fat),
    }));
  },

  async logFoodItem(item: Omit<FoodLogItem, 'id' | 'date'>): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthenticated dynamic food injection');

    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('food_logs').insert({
      user_id: user.id,
      date: today,
      food_name: item.food_name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    });

    if (error) throw new Error(error.message);
  },

  async addStaplePreset(staple: Omit<FoodStaple, 'id'>): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthenticated preset creation');

    const { error } = await supabase.from('food_staples').insert({
      user_id: user.id,
      label: staple.label,
      protein: staple.protein,
      carbs: staple.carbs,
      fat: staple.fat,
    });

    if (error) throw new Error(error.message);
  },

  async deleteFoodLogItem(id: number): Promise<void> {
    const { error } = await supabase.from('food_logs').delete().eq('id', id);

    if (error) throw new Error(error.message);
  },
  async updateTargets(targets: MacroTargets): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthenticated targets mutation');

    const { error } = await supabase
      .from('profiles')
      .update({
        target_calories: targets.target_calories,
        target_protein: targets.target_protein,
        target_carbs: targets.target_carbs,
        target_fat: targets.target_fat,
      })
      .eq('id', user.id);

    if (error) throw new Error(error.message);
  },

  async deleteStaplePreset(id: number): Promise<void> {
    const { error } = await supabase.from('food_staples').delete().eq('id', id);

    if (error) throw new Error(error.message);
  },
};
