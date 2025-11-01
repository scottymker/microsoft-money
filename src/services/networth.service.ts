import { supabase } from './supabase';
import type { NetWorthSnapshot, Account } from '../types';
import { format } from 'date-fns';

/**
 * Get all net worth snapshots for current user
 */
export const getNetWorthSnapshots = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('net_worth_snapshots')
    .select('*')
    .eq('user_id', user.id)
    .order('snapshot_date', { ascending: true });

  if (error) throw error;
  return data as NetWorthSnapshot[];
};

/**
 * Get a single net worth snapshot
 */
export const getNetWorthSnapshot = async (id: string) => {
  const { data, error } = await supabase
    .from('net_worth_snapshots')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as NetWorthSnapshot;
};

/**
 * Create a new net worth snapshot
 */
export const createNetWorthSnapshot = async (
  snapshot: Omit<NetWorthSnapshot, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('net_worth_snapshots')
    .insert({
      ...snapshot,
      user_id: user.id,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as NetWorthSnapshot;
};

/**
 * Update an existing net worth snapshot
 */
export const updateNetWorthSnapshot = async (
  id: string,
  updates: Partial<NetWorthSnapshot>
) => {
  const { data, error } = await supabase
    .from('net_worth_snapshots')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as NetWorthSnapshot;
};

/**
 * Delete a net worth snapshot
 */
export const deleteNetWorthSnapshot = async (id: string) => {
  const { error } = await supabase
    .from('net_worth_snapshots')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Calculate current net worth from accounts
 */
export const calculateCurrentNetWorth = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true);

  if (error) throw error;

  let totalAssets = 0;
  let totalLiabilities = 0;

  (accounts as Account[]).forEach((account) => {
    if (account.type === 'credit') {
      // Credit cards are liabilities (balance is typically negative)
      totalLiabilities += Math.abs(account.balance);
    } else {
      // Checking, savings, investment, cash are assets
      totalAssets += account.balance;
    }
  });

  const netWorth = totalAssets - totalLiabilities;

  return {
    total_assets: totalAssets,
    total_liabilities: totalLiabilities,
    net_worth: netWorth,
  };
};

/**
 * Take a snapshot of current net worth
 */
export const takeSnapshot = async (date?: string) => {
  const snapshotDate = date || format(new Date(), 'yyyy-MM-dd');
  const netWorthData = await calculateCurrentNetWorth();

  return createNetWorthSnapshot({
    snapshot_date: snapshotDate,
    total_assets: netWorthData.total_assets,
    total_liabilities: netWorthData.total_liabilities,
    net_worth: netWorthData.net_worth,
  });
};

/**
 * Get net worth for a specific date (or closest before)
 */
export const getNetWorthForDate = async (date: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('net_worth_snapshots')
    .select('*')
    .eq('user_id', user.id)
    .lte('snapshot_date', date)
    .order('snapshot_date', { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0] as NetWorthSnapshot | undefined;
};

/**
 * Calculate net worth change over period
 */
export const calculateNetWorthChange = (
  snapshots: NetWorthSnapshot[]
): {
  amount: number;
  percentage: number;
} => {
  if (snapshots.length < 2) {
    return { amount: 0, percentage: 0 };
  }

  const oldest = snapshots[0];
  const newest = snapshots[snapshots.length - 1];

  const amount = newest.net_worth - oldest.net_worth;
  const percentage = oldest.net_worth !== 0
    ? (amount / Math.abs(oldest.net_worth)) * 100
    : 0;

  return { amount, percentage };
};
