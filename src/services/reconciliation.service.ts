import { supabase } from './supabase';
import type { ReconciliationHistory, Transaction } from '../types';
import { updateTransaction } from './transactions.service';

/**
 * Get all reconciliation history for an account
 */
export const getReconciliationHistory = async (accountId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('reconciliation_history')
    .select('*')
    .eq('account_id', accountId)
    .order('statement_date', { ascending: false });

  if (error) throw error;
  return data as ReconciliationHistory[];
};

/**
 * Get a single reconciliation record
 */
export const getReconciliation = async (id: string) => {
  const { data, error } = await supabase
    .from('reconciliation_history')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as ReconciliationHistory;
};

/**
 * Create reconciliation history record
 */
export const createReconciliationHistory = async (
  reconciliation: Omit<ReconciliationHistory, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('reconciliation_history')
    .insert({
      ...reconciliation,
      user_id: user.id,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as ReconciliationHistory;
};

/**
 * Get unreconciled transactions for an account
 */
export const getUnreconciledTransactions = async (
  accountId: string,
  beforeDate?: string
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('account_id', accountId)
    .eq('reconciled', false)
    .order('date', { ascending: true });

  if (beforeDate) {
    query = query.lte('date', beforeDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Transaction[];
};

/**
 * Calculate reconciled balance
 */
export const calculateReconciledBalance = (
  transactions: Transaction[],
  beginningBalance: number
): number => {
  return transactions.reduce((balance, tx) => {
    return balance + tx.amount;
  }, beginningBalance);
};

/**
 * Reconcile multiple transactions
 */
export const reconcileTransactions = async (
  transactionIds: string[],
  accountId: string,
  statementDate: string,
  statementBeginningBalance: number,
  statementEndingBalance: number,
  notes?: string
) => {
  // Mark all transactions as reconciled
  const promises = transactionIds.map((id) =>
    updateTransaction(id, { reconciled: true })
  );
  await Promise.all(promises);

  // Get all reconciled transactions to calculate balance
  const { data: reconciledTxs } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .in('id', transactionIds);

  const reconciledBalance = calculateReconciledBalance(
    reconciledTxs as Transaction[],
    statementBeginningBalance
  );

  const difference = reconciledBalance - statementEndingBalance;

  // Create reconciliation history
  const history = await createReconciliationHistory({
    account_id: accountId,
    statement_date: statementDate,
    statement_beginning_balance: statementBeginningBalance,
    statement_ending_balance: statementEndingBalance,
    reconciled_balance: reconciledBalance,
    difference,
    transaction_count: transactionIds.length,
    notes,
  });

  return {
    history,
    reconciledBalance,
    difference,
    isBalanced: Math.abs(difference) < 0.01, // Allow for rounding
  };
};

/**
 * Undo reconciliation (unreconcile transactions from a session)
 */
export const undoReconciliation = async (reconciliationId: string) => {
  const reconciliation = await getReconciliation(reconciliationId);

  // Get all transactions reconciled in this session
  // This is approximate - we'll get transactions from that date
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', reconciliation.account_id)
    .eq('reconciled', true)
    .lte('date', reconciliation.statement_date);

  if (transactions) {
    // Unreconcile them
    const promises = (transactions as Transaction[]).map((tx) =>
      updateTransaction(tx.id, { reconciled: false })
    );
    await Promise.all(promises);
  }

  // Delete reconciliation history
  const { error } = await supabase
    .from('reconciliation_history')
    .delete()
    .eq('id', reconciliationId);

  if (error) throw error;
};
