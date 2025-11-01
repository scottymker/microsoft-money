import { useState, useEffect } from 'react';
import type { Budget, BudgetPeriod } from '../../types';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

interface BudgetFormProps {
  budget?: any;
  categories: { value: string; label: string }[];
  onSubmit: (data: Partial<Budget>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const BudgetForm = ({ budget, categories, onSubmit, onCancel, loading }: BudgetFormProps) => {
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    period: 'monthly' as BudgetPeriod,
    start_date: new Date().toISOString().split('T')[0],
    rollover: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (budget) {
      setFormData({
        category_id: budget.category_id,
        amount: budget.amount.toString(),
        period: budget.period,
        start_date: budget.start_date,
        rollover: budget.rollover,
      });
    } else if (categories.length > 0 && !formData.category_id) {
      setFormData((prev) => ({ ...prev, category_id: categories[0].value }));
    }
  }, [budget, categories]);

  const periodOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'annual', label: 'Annual' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid budget amount is required';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      category_id: formData.category_id,
      amount: parseFloat(formData.amount),
      period: formData.period,
      start_date: formData.start_date,
      rollover: formData.rollover,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Category"
        value={formData.category_id}
        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
        options={categories}
        required
        error={errors.category_id}
      />

      <Input
        label="Budget Amount"
        type="number"
        step="0.01"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        placeholder="500.00"
        required
        error={errors.amount}
      />

      <Select
        label="Period"
        value={formData.period}
        onChange={(e) => setFormData({ ...formData, period: e.target.value as BudgetPeriod })}
        options={periodOptions}
        required
      />

      <Input
        label="Start Date"
        type="date"
        value={formData.start_date}
        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
        required
        error={errors.start_date}
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="rollover"
          checked={formData.rollover}
          onChange={(e) => setFormData({ ...formData, rollover: e.target.checked })}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="rollover" className="ml-2 text-sm text-gray-700">
          Rollover unused budget to next period
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          Cancel
        </Button>
        <Button type="submit" loading={loading} fullWidth>
          {budget ? 'Update Budget' : 'Create Budget'}
        </Button>
      </div>
    </form>
  );
};

export default BudgetForm;
