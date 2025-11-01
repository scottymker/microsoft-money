import { supabase } from './supabase';
import type { Reminder } from '../types';
import { createTransaction } from './transactions.service';
import { format, addMonths, addYears } from 'date-fns';

/**
 * Get all reminders for current user
 */
export const getReminders = async (includeCompleted = false) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .order('due_date', { ascending: true });

  if (!includeCompleted) {
    query = query.eq('is_paid', false);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Reminder[];
};

/**
 * Get upcoming reminders (next N days)
 */
export const getUpcomingReminders = async (days: number = 30) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_paid', false)
    .gte('due_date', format(today, 'yyyy-MM-dd'))
    .lte('due_date', format(futureDate, 'yyyy-MM-dd'))
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data as Reminder[];
};

/**
 * Get overdue reminders
 */
export const getOverdueReminders = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const today = new Date();

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_paid', false)
    .lt('due_date', format(today, 'yyyy-MM-dd'))
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data as Reminder[];
};

/**
 * Get a single reminder
 */
export const getReminder = async (id: string) => {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Reminder;
};

/**
 * Create a new reminder
 */
export const createReminder = async (
  reminder: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('reminders')
    .insert({
      ...reminder,
      user_id: user.id,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as Reminder;
};

/**
 * Update an existing reminder
 */
export const updateReminder = async (
  id: string,
  updates: Partial<Reminder>
) => {
  const { data, error } = await supabase
    .from('reminders')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Reminder;
};

/**
 * Delete a reminder
 */
export const deleteReminder = async (id: string) => {
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Mark reminder as paid and create transaction
 */
export const markReminderAsPaid = async (
  reminderId: string,
  accountId: string,
  actualAmount?: number,
  actualDate?: string
) => {
  const reminder = await getReminder(reminderId);

  // Create transaction
  const transaction = await createTransaction({
    account_id: accountId,
    date: actualDate || reminder.due_date,
    amount: actualAmount !== undefined ? actualAmount : (reminder.amount || 0),
    payee: reminder.title,
    category: reminder.category || 'Uncategorized',
    memo: `Bill payment: ${reminder.title}`,
    reconciled: false,
  });

  // Update reminder
  const updatedReminder = await updateReminder(reminderId, {
    is_paid: true,
    linked_transaction_id: transaction.id,
  });

  // If recurring, create next reminder
  if (reminder.frequency && reminder.frequency !== 'one-time') {
    const dueDate = new Date(reminder.due_date);
    let nextDueDate: Date;

    if (reminder.frequency === 'monthly') {
      nextDueDate = addMonths(dueDate, 1);
    } else if (reminder.frequency === 'yearly') {
      nextDueDate = addYears(dueDate, 1);
    } else {
      nextDueDate = addMonths(dueDate, 1);
    }

    await createReminder({
      title: reminder.title,
      amount: reminder.amount,
      due_date: format(nextDueDate, 'yyyy-MM-dd'),
      frequency: reminder.frequency,
      is_paid: false,
      category: reminder.category,
      notes: reminder.notes,
    });
  }

  return { reminder: updatedReminder, transaction };
};

/**
 * Toggle reminder paid status
 */
export const toggleReminderPaid = async (id: string) => {
  const reminder = await getReminder(id);
  return updateReminder(id, {
    is_paid: !reminder.is_paid,
  });
};
