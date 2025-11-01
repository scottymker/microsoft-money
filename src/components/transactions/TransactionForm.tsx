import { useState, useEffect } from 'react';
import type { Transaction } from '../../types';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

interface TransactionFormProps {
  transaction?: Transaction;
  accounts: { value: string; label: string }[];
  onSubmit: (data: Partial<Transaction>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const TransactionForm = ({
  transaction,
  accounts,
  onSubmit,
  onCancel,
  loading,
}: TransactionFormProps) => {
  const [formData, setFormData] = useState({
    account_id: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    payee: '',
    category: '',
    memo: '',
    reconciled: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        account_id: transaction.account_id,
        date: transaction.date,
        amount: transaction.amount.toString(),
        payee: transaction.payee,
        category: transaction.category,
        memo: transaction.memo || '',
        reconciled: transaction.reconciled,
      });
    } else if (accounts.length > 0 && !formData.account_id) {
      setFormData((prev) => ({ ...prev, account_id: accounts[0].value }));
    }
  }, [transaction, accounts]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.account_id) {
      newErrors.account_id = 'Account is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.payee.trim()) {
      newErrors.payee = 'Payee is required';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      account_id: formData.account_id,
      date: formData.date,
      amount: parseFloat(formData.amount),
      payee: formData.payee.trim(),
      category: formData.category.trim(),
      memo: formData.memo.trim() || undefined,
      reconciled: formData.reconciled,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Account"
        value={formData.account_id}
        onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
        options={accounts}
        required
        error={errors.account_id}
      />

      <Input
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        required
        error={errors.date}
      />

      <Input
        label="Amount"
        type="number"
        step="0.01"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        placeholder="0.00"
        required
        error={errors.amount}
        helperText="Use negative for expenses, positive for income"
      />

      <Input
        label="Payee/Description"
        value={formData.payee}
        onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
        placeholder="Starbucks"
        required
        error={errors.payee}
      />

      <Input
        label="Category"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        placeholder="Dining"
        required
        error={errors.category}
      />

      <Input
        label="Memo"
        value={formData.memo}
        onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
        placeholder="Optional notes"
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="reconciled"
          checked={formData.reconciled}
          onChange={(e) => setFormData({ ...formData, reconciled: e.target.checked })}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="reconciled" className="ml-2 text-sm text-gray-700">
          Mark as reconciled
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          Cancel
        </Button>
        <Button type="submit" loading={loading} fullWidth>
          {transaction ? 'Update Transaction' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
