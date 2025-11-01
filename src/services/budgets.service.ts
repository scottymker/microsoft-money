import { supabase } from './supabase';
import type { Budget, BudgetPeriod } from '../types';
import { getTransactions } from './transactions.service';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

/**
 * Get all budgets for current user
 */
export const getBudgets = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('budgets')
    .select('*, categories(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get a single budget by ID
 */
export const getBudget = async (id: string) => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*, categories(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create a new budget
 */
export const createBudget = async (
  budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('budgets')
    .insert({
      ...budget,
      user_id: user.id,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as Budget;
};

/**
 * Update an existing budget
 */
export const updateBudget = async (
  id: string,
  updates: Partial<Budget>
) => {
  const { data, error } = await supabase
    .from('budgets')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Budget;
};

/**
 * Delete a budget
 */
export const deleteBudget = async (id: string) => {
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw error;
};

/**
 * Get budget spending summary
 */
export const getBudgetSpending = async (categoryId: string, period: BudgetPeriod) => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  if (period === 'monthly') {
    startDate = startOfMonth(now);
    endDate = endOfMonth(now);
  } else {
    startDate = startOfYear(now);
    endDate = endOfYear(now);
  }

  // Get the category name from the category ID
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('name')
    .eq('id', categoryId)
    .single();

  if (categoryError) throw categoryError;
  if (!category) return 0;

  const categoryName = (category as { name: string }).name;

  // Get all transactions in the date range
  const transactions = await getTransactions({
    dateRange: { start: startDate, end: endDate },
  });

  // Filter by category name (case-insensitive partial match)
  const categoryTransactions = transactions.filter((t) => {
    // Match exact category name or if transaction category contains the budget category
    const transactionCategory = t.category.toLowerCase();
    const budgetCategory = categoryName.toLowerCase();

    // Handle variations like "Rent/Mortgage" matching "Mortgage" or "Rent"
    return transactionCategory === budgetCategory ||
           transactionCategory.includes(budgetCategory) ||
           budgetCategory.includes(transactionCategory);
  });

  // Sum up expenses (negative amounts)
  const totalSpent = categoryTransactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return totalSpent;
};

/**
 * Get all budgets with spending data
 */
export const getBudgetsWithSpending = async () => {
  const budgets = await getBudgets();

  const budgetsWithSpending = await Promise.all(
    budgets.map(async (budget) => {
      const spent = await getBudgetSpending(budget.category_id, budget.period);
      const percentage = (spent / budget.amount) * 100;

      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percentage: Math.min(percentage, 100),
        status: percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'good',
      };
    })
  );

  return budgetsWithSpending;
};
