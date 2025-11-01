import { supabase } from './supabase';
import type { RecurringTransaction } from '../types';
import { createTransaction } from './transactions.service';
import { addWeeks, addMonths, addYears, isBefore, isAfter, format } from 'date-fns';

/**
 * Get all recurring transactions for current user
 */
export const getRecurringTransactions = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('next_date', { ascending: true });

  if (error) throw error;
  return data as RecurringTransaction[];
};

/**
 * Get a single recurring transaction
 */
export const getRecurringTransaction = async (id: string) => {
  const { data, error } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as RecurringTransaction;
};

/**
 * Create a new recurring transaction
 */
export const createRecurringTransaction = async (
  transaction: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('recurring_transactions')
    .insert({
      ...transaction,
      user_id: user.id,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as RecurringTransaction;
};

/**
 * Update an existing recurring transaction
 */
export const updateRecurringTransaction = async (
  id: string,
  updates: Partial<RecurringTransaction>
) => {
  const { data, error } = await supabase
    .from('recurring_transactions')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as RecurringTransaction;
};

/**
 * Delete a recurring transaction
 */
export const deleteRecurringTransaction = async (id: string) => {
  const { error } = await supabase
    .from('recurring_transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Calculate next occurrence date based on frequency
 */
const calculateNextDate = (currentDate: Date, frequency: string): Date => {
  switch (frequency) {
    case 'weekly':
      return addWeeks(currentDate, 1);
    case 'bi-weekly':
      return addWeeks(currentDate, 2);
    case 'monthly':
      return addMonths(currentDate, 1);
    case 'quarterly':
      return addMonths(currentDate, 3);
    case 'yearly':
      return addYears(currentDate, 1);
    default:
      return addMonths(currentDate, 1);
  }
};

/**
 * Process all recurring transactions and create due transactions
 * Should be called on app load or via scheduled job
 */
export const processRecurringTransactions = async () => {
  const recurring = await getRecurringTransactions();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const createdTransactions = [];

  for (const rec of recurring) {
    if (!rec.is_active) continue;

    const nextDate = new Date(rec.next_date);
    nextDate.setHours(0, 0, 0, 0);

    // Check if end date has passed
    if (rec.end_date) {
      const endDate = new Date(rec.end_date);
      endDate.setHours(0, 0, 0, 0);
      if (isAfter(today, endDate)) {
        // Deactivate expired recurring transaction
        await updateRecurringTransaction(rec.id, { is_active: false });
        continue;
      }
    }

    // Check if transaction is due
    if (isBefore(nextDate, today) || nextDate.getTime() === today.getTime()) {
      // Check if we already created today's transaction
      const lastCreatedDate = rec.last_created_date ? new Date(rec.last_created_date) : null;
      if (lastCreatedDate) {
        lastCreatedDate.setHours(0, 0, 0, 0);
        if (lastCreatedDate.getTime() === today.getTime()) {
          continue; // Already created today
        }
      }

      // Create the transaction
      const transaction = await createTransaction({
        account_id: rec.account_id,
        date: format(nextDate, 'yyyy-MM-dd'),
        amount: rec.amount,
        payee: rec.payee,
        category: rec.category,
        subcategory: rec.subcategory,
        memo: rec.memo ? `${rec.memo} (Auto-generated)` : 'Auto-generated from recurring transaction',
        reconciled: false,
        recurring_transaction_id: rec.id,
      });

      createdTransactions.push(transaction);

      // Update next_date and last_created_date
      const newNextDate = calculateNextDate(nextDate, rec.frequency);
      await updateRecurringTransaction(rec.id, {
        next_date: format(newNextDate, 'yyyy-MM-dd'),
        last_created_date: format(today, 'yyyy-MM-dd'),
      });
    }
  }

  return createdTransactions;
};

/**
 * Toggle recurring transaction active status
 */
export const toggleRecurringActive = async (id: string) => {
  const transaction = await getRecurringTransaction(id);
  return updateRecurringTransaction(id, {
    is_active: !transaction.is_active,
  });
};
