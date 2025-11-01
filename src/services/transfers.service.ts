import { supabase } from './supabase';
import type { Transaction } from '../types';

/**
 * Create a transfer between two accounts
 * Creates two linked transactions - one debit, one credit
 */
export const createTransfer = async (
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  date: string,
  memo?: string
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (fromAccountId === toAccountId) {
    throw new Error('Cannot transfer to the same account');
  }

  if (amount <= 0) {
    throw new Error('Transfer amount must be positive');
  }

  // Get account names for payee field
  const { data: fromAccount } = await supabase
    .from('accounts')
    .select('name')
    .eq('id', fromAccountId)
    .single();

  const { data: toAccount } = await supabase
    .from('accounts')
    .select('name')
    .eq('id', toAccountId)
    .single();

  if (!fromAccount || !toAccount) {
    throw new Error('Invalid account IDs');
  }

  // Create withdrawal transaction (negative amount)
  const { data: withdrawalTx, error: withdrawalError } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      account_id: fromAccountId,
      date,
      amount: -amount,
      payee: `Transfer to ${toAccount.name}`,
      category: '[Transfer]',
      memo,
      reconciled: false,
      transaction_type: 'transfer',
    } as any)
    .select()
    .single();

  if (withdrawalError) throw withdrawalError;

  // Create deposit transaction (positive amount)
  const { data: depositTx, error: depositError } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      account_id: toAccountId,
      date,
      amount: amount,
      payee: `Transfer from ${fromAccount.name}`,
      category: '[Transfer]',
      memo,
      reconciled: false,
      transaction_type: 'transfer',
      linked_transaction_id: withdrawalTx.id,
    } as any)
    .select()
    .single();

  if (depositError) throw depositError;

  // Link the withdrawal to the deposit
  await supabase
    .from('transactions')
    .update({ linked_transaction_id: depositTx.id } as any)
    .eq('id', withdrawalTx.id);

  // Update account balances
  await updateAccountBalance(fromAccountId, -amount);
  await updateAccountBalance(toAccountId, amount);

  return {
    withdrawal: withdrawalTx as Transaction,
    deposit: depositTx as Transaction,
  };
};

/**
 * Delete a transfer (deletes both linked transactions)
 */
export const deleteTransfer = async (transactionId: string) => {
  const { data: transaction, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (fetchError) throw fetchError;

  if (transaction.transaction_type !== 'transfer') {
    throw new Error('Transaction is not a transfer');
  }

  const linkedId = transaction.linked_transaction_id;

  // Delete both transactions
  const { error: deleteError1 } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId);

  if (deleteError1) throw deleteError1;

  if (linkedId) {
    const { error: deleteError2 } = await supabase
      .from('transactions')
      .delete()
      .eq('id', linkedId);

    if (deleteError2) throw deleteError2;
  }

  // Reverse account balance changes
  await updateAccountBalance(transaction.account_id, -transaction.amount);

  if (linkedId) {
    const { data: linkedTransaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', linkedId)
      .single();

    if (linkedTransaction) {
      await updateAccountBalance(linkedTransaction.account_id, -linkedTransaction.amount);
    }
  }
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
