import { useState } from 'react';
import type { NetWorthSnapshot } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';

interface NetWorthFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: NetWorthSnapshot;
  submitting?: boolean;
}

export default function NetWorthForm({ onSubmit, onCancel, initialData, submitting }: NetWorthFormProps) {
  const [formData, setFormData] = useState({
    snapshot_date: initialData?.snapshot_date || new Date().toISOString().split('T')[0],
    total_assets: initialData?.total_assets?.toString() || '',
    total_liabilities: initialData?.total_liabilities?.toString() || '0'
  });

  const calculateNetWorth = () => {
    const assets = parseFloat(formData.total_assets) || 0;
    const liabilities = parseFloat(formData.total_liabilities) || 0;
    return assets - liabilities;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const assets = parseFloat(formData.total_assets);
    const liabilities = parseFloat(formData.total_liabilities);
    const netWorth = assets - liabilities;

    const data = {
      snapshot_date: formData.snapshot_date,
      total_assets: assets,
      total_liabilities: liabilities,
      net_worth: netWorth
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Snapshot Date"
        type="date"
        value={formData.snapshot_date}
        onChange={(e) => setFormData({ ...formData, snapshot_date: e.target.value })}
        required
      />

      <Input
        label="Total Assets"
        type="number"
        step="0.01"
        value={formData.total_assets}
        onChange={(e) => setFormData({ ...formData, total_assets: e.target.value })}
        placeholder="0.00"
        required
      />

      <Input
        label="Total Liabilities"
        type="number"
        step="0.01"
        value={formData.total_liabilities}
        onChange={(e) => setFormData({ ...formData, total_liabilities: e.target.value })}
        placeholder="0.00"
      />

      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Calculated Net Worth:</span>
          <span className={`text-xl font-bold ${calculateNetWorth() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(calculateNetWorth()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
