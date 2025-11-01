import { useState, useEffect } from 'react';
import type { Reminder } from '../../types';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { getCategories } from '../../services/categories.service';
import type { Category } from '../../types';

interface ReminderFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: Reminder;
  submitting?: boolean;
}

export default function ReminderForm({ onSubmit, onCancel, initialData, submitting }: ReminderFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    amount: initialData?.amount?.toString() || '',
    due_date: initialData?.due_date || new Date().toISOString().split('T')[0],
    frequency: initialData?.frequency || 'one-time',
    category: initialData?.category || '',
    notes: initialData?.notes || '',
    is_paid: initialData?.is_paid || false
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      amount: formData.amount ? parseFloat(formData.amount) : undefined,
      notes: formData.notes || undefined,
      category: formData.category || undefined
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="e.g., Electric Bill, Rent Payment"
        required
      />

      <Input
        label="Amount (optional)"
        type="number"
        step="0.01"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        placeholder="0.00"
      />

      <Input
        label="Due Date"
        type="date"
        value={formData.due_date}
        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
        required
      />

      <Select
        label="Frequency"
        value={formData.frequency}
        onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
        options={[
          { value: 'one-time', label: 'One-time' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' }
        ]}
        required
      />

      <Select
        label="Category (optional)"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        options={[
          { value: '', label: 'Select category' },
          ...categories.map((cat) => ({
            value: cat.name,
            label: cat.name
          }))
        ]}
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
