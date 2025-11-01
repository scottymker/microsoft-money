import { supabase } from './supabase';
import type { SavingsGoal } from '../types';
import { differenceInMonths, differenceInDays } from 'date-fns';

/**
 * Get all savings goals for current user
 */
export const getSavingsGoals = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as SavingsGoal[];
};

/**
 * Get a single savings goal
 */
export const getSavingsGoal = async (id: string) => {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as SavingsGoal;
};

/**
 * Create a new savings goal
 */
export const createSavingsGoal = async (
  goal: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('savings_goals')
    .insert({
      ...goal,
      user_id: user.id,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as SavingsGoal;
};

/**
 * Update an existing savings goal
 */
export const updateSavingsGoal = async (
  id: string,
  updates: Partial<SavingsGoal>
): Promise<SavingsGoal> => {
  const { data, error } = await supabase
    .from('savings_goals')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Check if goal is now completed
  const goal = data as SavingsGoal;
  if (goal.current_amount >= goal.target_amount && !goal.is_completed) {
    return updateSavingsGoal(id, { is_completed: true });
  }

  return goal;
};

/**
 * Delete a savings goal
 */
export const deleteSavingsGoal = async (id: string) => {
  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Add amount to savings goal
 */
export const addToSavingsGoal = async (id: string, amount: number) => {
  const goal = await getSavingsGoal(id);
  const newAmount = goal.current_amount + amount;

  return updateSavingsGoal(id, {
    current_amount: newAmount,
  });
};

/**
 * Calculate progress percentage
 */
export const calculateGoalProgress = (goal: SavingsGoal): number => {
  if (goal.target_amount <= 0) return 0;
  const progress = (goal.current_amount / goal.target_amount) * 100;
  return Math.min(Math.round(progress), 100);
};

/**
 * Calculate monthly savings needed to reach goal
 */
export const calculateMonthlySavingsNeeded = (goal: SavingsGoal): number => {
  if (!goal.target_date) return 0;

  const remaining = goal.target_amount - goal.current_amount;
  if (remaining <= 0) return 0;

  const today = new Date();
  const targetDate = new Date(goal.target_date);
  const monthsRemaining = differenceInMonths(targetDate, today);

  if (monthsRemaining <= 0) return remaining; // Past due

  return remaining / monthsRemaining;
};

/**
 * Calculate days until target date
 */
export const calculateDaysRemaining = (goal: SavingsGoal): number => {
  if (!goal.target_date) return 0;

  const today = new Date();
  const targetDate = new Date(goal.target_date);
  return differenceInDays(targetDate, today);
};

/**
 * Sync goal with linked account balance
 */
export const syncGoalWithAccount = async (goalId: string) => {
  const goal = await getSavingsGoal(goalId);

  if (!goal.linked_account_id) {
    throw new Error('Goal is not linked to an account');
  }

  const { data: account, error } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', goal.linked_account_id)
    .single();

  if (error) throw error;
  if (!account) throw new Error('Linked account not found');

  return updateSavingsGoal(goalId, {
    current_amount: (account as { balance: number }).balance,
  });
};
