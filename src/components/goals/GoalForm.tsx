import { useState, useEffect } from 'react';
import type { SavingsGoal, Account } from '../../types';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import ColorPicker from '../common/ColorPicker';
import { getAccounts } from '../../services/accounts.service';

interface GoalFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: SavingsGoal;
  submitting?: boolean;
}

export default function GoalForm({ onSubmit, onCancel, initialData, submitting }: GoalFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    target_amount: initialData?.target_amount?.toString() || '',
    current_amount: initialData?.current_amount?.toString() || '0',
    target_date: initialData?.target_date || '',
    linked_account_id: initialData?.linked_account_id || '',
    color: initialData?.color || '#3B82F6',
    notes: initialData?.notes || '',
    is_completed: initialData?.is_completed || false
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await getAccounts(true);
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount),
      target_date: formData.target_date || undefined,
      linked_account_id: formData.linked_account_id || undefined,
      notes: formData.notes || undefined
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Goal Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="e.g., Emergency Fund, Vacation, New Car"
        required
      />

      <Input
        label="Target Amount"
        type="number"
        step="0.01"
        value={formData.target_amount}
        onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
        placeholder="0.00"
        required
      />

      <Input
        label="Current Amount"
        type="number"
        step="0.01"
        value={formData.current_amount}
        onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
        placeholder="0.00"
        required
      />

      <Input
        label="Target Date (optional)"
        type="date"
        value={formData.target_date}
        onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
      />

      <Select
        label="Linked Account (optional)"
        value={formData.linked_account_id}
        onChange={(e) => setFormData({ ...formData, linked_account_id: e.target.value })}
        options={[
          { value: '', label: 'None - Track manually' },
          ...accounts.map((account) => ({
            value: account.id,
            label: `${account.name} ($${account.balance.toFixed(2)})`
          }))
        ]}
      />

      <ColorPicker
        label="Color"
        value={formData.color}
        onChange={(color) => setFormData({ ...formData, color })}
      />

      <Input
        label="Notes (optional)"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        placeholder="Additional details..."
      />

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
