import { useState } from 'react';
import type { Category, CategoryType } from '../../types';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import ColorPicker from '../common/ColorPicker';

interface CategoryFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: Category;
  submitting?: boolean;
}

export default function CategoryForm({ onSubmit, onCancel, initialData, submitting }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'expense' as CategoryType,
    color: initialData?.color || '#3B82F6',
    icon: initialData?.icon || '',
    order: initialData?.order?.toString() || '0'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      type: formData.type,
      color: formData.color,
      icon: formData.icon || undefined,
      order: parseInt(formData.order) || 0
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Category Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="e.g., Groceries, Utilities, Salary"
        required
      />

      <Select
        label="Type"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value as CategoryType })}
        options={[
          { value: 'expense', label: 'Expense' },
          { value: 'income', label: 'Income' }
        ]}
        required
      />

      <ColorPicker
        label="Color"
        value={formData.color}
        onChange={(color) => setFormData({ ...formData, color })}
      />

      <Input
        label="Icon (optional emoji)"
        value={formData.icon}
        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
        placeholder="e.g., 🛒 🏠 💰"
        maxLength={2}
      />

      <Input
        label="Sort Order"
        type="number"
        value={formData.order}
        onChange={(e) => setFormData({ ...formData, order: e.target.value })}
        placeholder="0"
        required
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
