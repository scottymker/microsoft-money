import { useState, useEffect } from 'react';
import type { InvestmentHolding, Account, AssetType } from '../../types';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { getAccounts } from '../../services/accounts.service';

interface InvestmentFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: InvestmentHolding;
  submitting?: boolean;
}

export default function InvestmentForm({ onSubmit, onCancel, initialData, submitting }: InvestmentFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState({
    account_id: initialData?.account_id || '',
    symbol: initialData?.symbol || '',
    name: initialData?.name || '',
    shares: initialData?.shares?.toString() || '',
    cost_basis: initialData?.cost_basis?.toString() || '',
    current_price: initialData?.current_price?.toString() || '',
    asset_type: initialData?.asset_type || 'stock' as AssetType
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await getAccounts(true);
      // Filter to only investment and retirement accounts
      const investmentAccounts = data.filter(
        acc => acc.type === 'investment' || acc.type === 'retirement'
      );
      setAccounts(investmentAccounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      account_id: formData.account_id,
      symbol: formData.symbol.toUpperCase(),
      name: formData.name || undefined,
      shares: parseFloat(formData.shares),
      cost_basis: parseFloat(formData.cost_basis),
      current_price: formData.current_price ? parseFloat(formData.current_price) : undefined,
      asset_type: formData.asset_type
    };

    await onSubmit(data);
  };

  const calculateCurrentValue = () => {
    const shares = parseFloat(formData.shares) || 0;
    const price = parseFloat(formData.current_price) || 0;
    return shares * price;
  };

  const calculateGainLoss = () => {
    const currentValue = calculateCurrentValue();
    const costBasis = parseFloat(formData.cost_basis) || 0;
    return currentValue - costBasis;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Investment Account"
        value={formData.account_id}
        onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
        options={[
          { value: '', label: 'Select account' },
          ...accounts.map((account) => ({
            value: account.id,
            label: `${account.name} ($${account.balance.toFixed(2)})`
          }))
        ]}
        required
      />

      {accounts.length === 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            No investment or retirement accounts found. Please create one first.
          </p>
        </div>
      )}

      <Input
        label="Symbol"
        value={formData.symbol}
        onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
        placeholder="e.g., AAPL, MSFT, BTC"
        required
      />

      <Input
        label="Name (optional)"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="e.g., Apple Inc., Bitcoin"
      />

      <Input
        label="Number of Shares"
        type="number"
        step="0.00000001"
        value={formData.shares}
        onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
        placeholder="0.00"
        required
      />

      <Input
        label="Cost Basis (Total)"
        type="number"
        step="0.01"
        value={formData.cost_basis}
        onChange={(e) => setFormData({ ...formData, cost_basis: e.target.value })}
        placeholder="Total amount paid for all shares"
        required
      />

      <Input
        label="Current Price per Share (optional)"
        type="number"
        step="0.01"
        value={formData.current_price}
        onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
        placeholder="Current market price"
      />

      <Select
        label="Asset Type"
        value={formData.asset_type}
        onChange={(e) => setFormData({ ...formData, asset_type: e.target.value as AssetType })}
        options={[
          { value: 'stock', label: 'Stock' },
          { value: 'etf', label: 'ETF' },
          { value: 'mutual_fund', label: 'Mutual Fund' },
          { value: 'bond', label: 'Bond' },
          { value: 'crypto', label: 'Cryptocurrency' },
          { value: 'other', label: 'Other' }
        ]}
        required
      />

      {formData.current_price && formData.shares && formData.cost_basis && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700">Current Value:</span>
            <span className="font-semibold text-gray-900">
              ${calculateCurrentValue().toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700">Gain/Loss:</span>
            <span className={`font-semibold ${calculateGainLoss() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {calculateGainLoss() >= 0 ? '+' : ''}${calculateGainLoss().toFixed(2)}
              {' '}
              ({((calculateGainLoss() / parseFloat(formData.cost_basis)) * 100).toFixed(2)}%)
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || accounts.length === 0}>
          {submitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
