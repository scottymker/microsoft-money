import { supabase } from './supabase';
import type { Account } from '../types';

/**
 * Get all accounts for current user
 */
export const getAccounts = async (activeOnly: boolean = false) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('name');

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Account[];
};

/**
 * Get a single account by ID
 */
export const getAccount = async (id: string) => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Account;
};

/**
 * Create a new account
 */
export const createAccount = async (
  account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('accounts')
    .insert({
      ...account,
      user_id: user.id,
      balance: account.opening_balance, // Initialize balance with opening balance
    })
    .select()
    .single();

  if (error) throw error;
  return data as Account;
};

/**
 * Update an existing account
 */
export const updateAccount = async (
  id: string,
  updates: Partial<Account>
) => {
  const { data, error } = await supabase
    .from('accounts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Account;
};

/**
 * Delete an account (soft delete by setting is_active to false)
 */
export const deleteAccount = async (id: string, hardDelete: boolean = false) => {
  if (hardDelete) {
    // Hard delete - actually remove from database
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) throw error;
  } else {
    // Soft delete - just mark as inactive
    await updateAccount(id, { is_active: false });
  }
};

/**
 * Get account balance summary
 */
export const getAccountBalanceSummary = async () => {
  const accounts = await getAccounts(true);

  const summary = {
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
    accountsByType: {} as Record<string, number>,
  };

  accounts.forEach((account) => {
    const balance = account.balance;

    // Categorize by type
    if (!summary.accountsByType[account.type]) {
      summary.accountsByType[account.type] = 0;
    }
    summary.accountsByType[account.type] += balance;

    // Calculate assets vs liabilities
    if (account.type === 'credit') {
      // Credit cards are liabilities (negative balance means you owe money)
      summary.totalLiabilities += Math.abs(balance);
    } else {
      // Checking, savings, cash, investment are assets
      summary.totalAssets += balance;
    }
  });

  summary.netWorth = summary.totalAssets - summary.totalLiabilities;

  return summary;
};

/**
 * Reconcile account - mark transactions as reconciled up to a certain balance
 */
export const reconcileAccount = async (
  accountId: string,
  reconcileDate: string,
  expectedBalance: number
) => {
  // Get all unreconciled transactions for this account up to the reconcile date
  const { data: transactions, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .eq('reconciled', false)
    .lte('date', reconcileDate)
    .order('date');

  if (fetchError) throw fetchError;

  type TransactionRow = { id: string; amount: number };
  const typedTransactions = (transactions || []) as TransactionRow[];

  // Calculate what the balance should be
  const calculatedBalance = typedTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const account = await getAccount(accountId);
  const currentReconciled = account.balance - calculatedBalance;

  // Check if calculated matches expected
  const difference = Math.abs(currentReconciled + calculatedBalance - expectedBalance);

  if (difference > 0.01) {
    // Allow 1 cent rounding difference
    throw new Error(
      `Balance mismatch: Expected ${expectedBalance}, calculated ${currentReconciled + calculatedBalance}. Difference: ${difference.toFixed(2)}`
    );
  }

  // Mark all transactions as reconciled
  const transactionIds = typedTransactions.map((t) => t.id);

  if (transactionIds.length > 0) {
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ reconciled: true })
      .in('id', transactionIds);

    if (updateError) throw updateError;
  }

  return {
    reconciledCount: transactionIds.length,
    balance: expectedBalance,
  };
};
