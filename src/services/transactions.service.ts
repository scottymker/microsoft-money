import { supabase } from './supabase';
import type { Transaction, FilterOptions } from '../types';

/**
 * Get all transactions for current user
 */
export const getTransactions = async (filters?: FilterOptions) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  // Apply filters
  if (filters) {
    if (filters.accountIds && filters.accountIds.length > 0) {
      query = query.in('account_id', filters.accountIds);
    }

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      query = query.in('category', filters.categoryIds);
    }

    if (filters.dateRange) {
      const startDate = filters.dateRange.start.toISOString().split('T')[0];
      const endDate = filters.dateRange.end.toISOString().split('T')[0];
      query = query.gte('date', startDate).lte('date', endDate);
    }

    if (filters.searchTerm) {
      query = query.or(
        `payee.ilike.%${filters.searchTerm}%,memo.ilike.%${filters.searchTerm}%`
      );
    }

    if (filters.minAmount !== undefined) {
      query = query.gte('amount', filters.minAmount);
    }

    if (filters.maxAmount !== undefined) {
      query = query.lte('amount', filters.maxAmount);
    }

    if (filters.reconciled !== undefined) {
      query = query.eq('reconciled', filters.reconciled);
    }
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Transaction[];
};

/**
 * Get a single transaction by ID
 */
export const getTransaction = async (id: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Transaction;
};

/**
 * Create a new transaction
 */
export const createTransaction = async (
  transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...transaction,
      user_id: user.id,
    } as any)
    .select()
    .single();

  if (error) throw error;

  // Update account balance
  await updateAccountBalance(transaction.account_id, transaction.amount);

  return data as Transaction;
};

/**
 * Update an existing transaction
 */
export const updateTransaction = async (
  id: string,
  updates: Partial<Transaction>
) => {
  // Get the old transaction to calculate balance diff
  const oldTransaction = await getTransaction(id);

  const { data, error } = await supabase
    .from('transactions')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Update account balance if amount or account changed
  if (updates.amount !== undefined || updates.account_id !== undefined) {
    // Reverse old amount
    await updateAccountBalance(oldTransaction.account_id, -oldTransaction.amount);

    // Apply new amount
    const newAccountId = updates.account_id || oldTransaction.account_id;
    const newAmount = updates.amount !== undefined ? updates.amount : oldTransaction.amount;
    await updateAccountBalance(newAccountId, newAmount);
  }

  return data as Transaction;
};

/**
 * Delete a transaction
 */
export const deleteTransaction = async (id: string) => {
  const transaction = await getTransaction(id);

  const { error } = await supabase.from('transactions').delete().eq('id', id);

  if (error) throw error;

  // Reverse the transaction amount from account balance
  await updateAccountBalance(transaction.account_id, -transaction.amount);
};

/**
 * Bulk create transactions (for CSV import)
 */
export const createTransactionsBulk = async (
  transactions: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const transactionsWithUser = transactions.map((t) => ({
    ...t,
    user_id: user.id,
  }));

  const { data, error } = await supabase
    .from('transactions')
    .insert(transactionsWithUser as any)
    .select();

  if (error) throw error;

  // Update account balances
  const accountTotals = new Map<string, number>();
  transactions.forEach((t) => {
    const current = accountTotals.get(t.account_id) || 0;
    accountTotals.set(t.account_id, current + t.amount);
  });

  for (const [accountId, total] of accountTotals) {
    await updateAccountBalance(accountId, total);
  }

  return data as Transaction[];
};

/**
 * Toggle transaction reconciled status
 */
export const toggleReconciled = async (id: string) => {
  const transaction = await getTransaction(id);

  return updateTransaction(id, {
    reconciled: !transaction.reconciled,
  });
};

/**
 * Helper: Update account balance
 */
const updateAccountBalance = async (accountId: string, amountChange: number) => {
  const { data: account, error: fetchError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', accountId)
    .single();

  if (fetchError) throw fetchError;
  if (!account) throw new Error('Account not found');

  const newBalance = (account as { balance: number }).balance + amountChange;

  const { error: updateError } = await supabase
    .from('accounts')
    .update({ balance: newBalance } as any)
    .eq('id', accountId);

  if (updateError) throw updateError;
};
