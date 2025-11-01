import { supabase } from './supabase';
import type { InvestmentHolding } from '../types';

/**
 * Get all investment holdings for current user
 */
export const getInvestmentHoldings = async (accountId?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('investment_holdings')
    .select('*')
    .eq('user_id', user.id)
    .order('symbol', { ascending: true });

  if (accountId) {
    query = query.eq('account_id', accountId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as InvestmentHolding[];
};

/**
 * Get a single investment holding
 */
export const getInvestmentHolding = async (id: string) => {
  const { data, error } = await supabase
    .from('investment_holdings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as InvestmentHolding;
};

/**
 * Create a new investment holding
 */
export const createInvestmentHolding = async (
  holding: Omit<InvestmentHolding, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('investment_holdings')
    .insert({
      ...holding,
      user_id: user.id,
      last_updated: new Date().toISOString(),
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as InvestmentHolding;
};

/**
 * Update an existing investment holding
 */
export const updateInvestmentHolding = async (
  id: string,
  updates: Partial<InvestmentHolding>
) => {
  const { data, error } = await supabase
    .from('investment_holdings')
    .update({
      ...updates,
      last_updated: new Date().toISOString(),
    } as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as InvestmentHolding;
};

/**
 * Delete an investment holding
 */
export const deleteInvestmentHolding = async (id: string) => {
  const { error } = await supabase
    .from('investment_holdings')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Calculate current value of holding
 */
export const calculateHoldingValue = (holding: InvestmentHolding): number => {
  if (!holding.current_price) return 0;
  return holding.shares * holding.current_price;
};

/**
 * Calculate gain/loss for holding
 */
export const calculateHoldingGainLoss = (
  holding: InvestmentHolding
): {
  amount: number;
  percentage: number;
} => {
  const currentValue = calculateHoldingValue(holding);
  const amount = currentValue - holding.cost_basis;
  const percentage = holding.cost_basis !== 0
    ? (amount / holding.cost_basis) * 100
    : 0;

  return { amount, percentage };
};

/**
 * Get portfolio summary for an account
 */
export const getPortfolioSummary = async (accountId: string) => {
  const holdings = await getInvestmentHoldings(accountId);

  let totalValue = 0;
  let totalCostBasis = 0;

  holdings.forEach((holding) => {
    totalValue += calculateHoldingValue(holding);
    totalCostBasis += holding.cost_basis;
  });

  const totalGainLoss = totalValue - totalCostBasis;
  const totalGainLossPercentage = totalCostBasis !== 0
    ? (totalGainLoss / totalCostBasis) * 100
    : 0;

  return {
    holdings,
    totalValue,
    totalCostBasis,
    totalGainLoss,
    totalGainLossPercentage,
  };
};

/**
 * Update price for a holding
 */
export const updateHoldingPrice = async (id: string, newPrice: number) => {
  return updateInvestmentHolding(id, {
    current_price: newPrice,
  });
};

/**
 * Buy shares (add to existing or create new holding)
 */
export const buyShares = async (
  accountId: string,
  symbol: string,
  shares: number,
  pricePerShare: number,
  name?: string,
  assetType?: string
) => {
  // Check if holding already exists
  const { data: existingHolding } = await supabase
    .from('investment_holdings')
    .select('*')
    .eq('account_id', accountId)
    .eq('symbol', symbol)
    .single();

  if (existingHolding) {
    // Add to existing holding
    const holding = existingHolding as InvestmentHolding;
    const newShares = holding.shares + shares;
    const additionalCost = shares * pricePerShare;
    const newCostBasis = holding.cost_basis + additionalCost;

    return updateInvestmentHolding(holding.id, {
      shares: newShares,
      cost_basis: newCostBasis,
      current_price: pricePerShare,
    });
  } else {
    // Create new holding
    return createInvestmentHolding({
      account_id: accountId,
      symbol,
      name,
      shares,
      cost_basis: shares * pricePerShare,
      current_price: pricePerShare,
      asset_type: assetType as any,
    });
  }
};

/**
 * Sell shares
 */
export const sellShares = async (
  id: string,
  sharesToSell: number,
  pricePerShare: number
) => {
  const holding = await getInvestmentHolding(id);

  if (sharesToSell > holding.shares) {
    throw new Error('Cannot sell more shares than owned');
  }

  const newShares = holding.shares - sharesToSell;
  const saleRatio = sharesToSell / holding.shares;
  const newCostBasis = holding.cost_basis * (1 - saleRatio);

  if (newShares === 0) {
    // Sold all shares, delete holding
    await deleteInvestmentHolding(id);
    return null;
  } else {
    return updateInvestmentHolding(id, {
      shares: newShares,
      cost_basis: newCostBasis,
      current_price: pricePerShare,
    });
  }
};
