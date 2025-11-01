import { useState, useEffect } from 'react';
import type { Account, AccountType } from '../../types';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

interface AccountFormProps {
  account?: Account;
  onSubmit: (data: Partial<Account>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const AccountForm = ({ account, onSubmit, onCancel, loading }: AccountFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking' as AccountType,
    opening_balance: '0',
    currency: 'USD',
    institution: '',
    account_number: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        opening_balance: account.opening_balance.toString(),
        currency: account.currency,
        institution: account.institution || '',
        account_number: account.account_number || '',
      });
    }
  }, [account]);

  const accountTypes = [
    { value: 'checking', label: 'Checking Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'investment', label: 'Investment Account' },
    { value: 'cash', label: 'Cash' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }

    if (!formData.opening_balance || isNaN(parseFloat(formData.opening_balance))) {
      newErrors.opening_balance = 'Valid opening balance is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      name: formData.name.trim(),
      type: formData.type,
      opening_balance: parseFloat(formData.opening_balance),
      currency: formData.currency,
      institution: formData.institution.trim() || undefined,
      account_number: formData.account_number.trim() || undefined,
      is_active: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Account Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="My Checking Account"
        required
        error={errors.name}
      />

      <Select
        label="Account Type"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value as AccountType })}
        options={accountTypes}
        required
      />

      <Input
        label="Opening Balance"
        type="number"
        step="0.01"
        value={formData.opening_balance}
        onChange={(e) => setFormData({ ...formData, opening_balance: e.target.value })}
        placeholder="0.00"
        required
        error={errors.opening_balance}
        helperText="Enter the current balance of this account"
      />

      <Input
        label="Institution"
        value={formData.institution}
        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
        placeholder="Bank of America"
        helperText="Optional: The bank or financial institution"
      />

      <Input
        label="Account Number (Last 4 digits)"
        value={formData.account_number}
        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
        placeholder="1234"
        maxLength={4}
        helperText="Optional: Last 4 digits for identification"
      />

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          Cancel
        </Button>
        <Button type="submit" loading={loading} fullWidth>
          {account ? 'Update Account' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
};

export default AccountForm;
