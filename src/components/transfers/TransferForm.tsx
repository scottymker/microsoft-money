import { useState } from 'react';
import type { Account } from '../../types';
import { createTransfer } from '../../services/transfers.service';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { useToast } from '../common/ToastContainer';
import { ArrowRightLeft } from 'lucide-react';

interface TransferFormProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onSuccess: () => void;
}

/**
 * Transfer form modal for creating transfers between accounts
 * Creates two linked transactions (debit and credit)
 */
export default function TransferForm({
  isOpen,
  onClose,
  accounts,
  onSuccess
}: TransferFormProps) {
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    memo: ''
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fromAccountId || !formData.toAccountId || !formData.amount) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (formData.fromAccountId === formData.toAccountId) {
      showToast('Cannot transfer to the same account', 'error');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      showToast('Amount must be greater than zero', 'error');
      return;
    }

    setLoading(true);
    try {
      await createTransfer(
        formData.fromAccountId,
        formData.toAccountId,
        amount,
        formData.date,
        formData.memo || undefined
      );

      showToast('Transfer created successfully', 'success');
      onSuccess();
      handleClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to create transfer', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fromAccountId: '',
      toAccountId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      memo: ''
    });
    onClose();
  };

  const fromAccount = accounts.find(a => a.id === formData.fromAccountId);
  const toAccount = accounts.find(a => a.id === formData.toAccountId);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Transfer Between Accounts">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <ArrowRightLeft className="inline h-4 w-4 mr-1" />
            This will create two linked transactions: a withdrawal from the source account and a deposit to the destination account.
          </p>
        </div>

        <Select
          label="From Account"
          value={formData.fromAccountId}
          onChange={(e) => setFormData({ ...formData, fromAccountId: e.target.value })}
          options={[
            { value: '', label: 'Select source account' },
            ...accounts.map((account) => ({
              value: account.id,
              label: `${account.name} ($${account.balance.toFixed(2)})`
            }))
          ]}
          required
        />

        {fromAccount && fromAccount.balance < parseFloat(formData.amount || '0') && (
          <p className="text-sm text-amber-600">
            Warning: This transfer will overdraw the account
          </p>
        )}

        <Select
          label="To Account"
          value={formData.toAccountId}
          onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
          options={[
            { value: '', label: 'Select destination account' },
            ...accounts
              .filter(a => a.id !== formData.fromAccountId)
              .map((account) => ({
                value: account.id,
                label: `${account.name} ($${account.balance.toFixed(2)})`
              }))
          ]}
          required
        />

        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="Enter transfer amount"
          required
        />

        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />

        <Input
          label="Memo (optional)"
          value={formData.memo}
          onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
          placeholder="Add a note about this transfer"
        />

        {formData.fromAccountId && formData.toAccountId && formData.amount && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Transfer Summary:</p>
            <div className="text-sm space-y-1">
              <p>
                <span className="text-red-600">- ${parseFloat(formData.amount).toFixed(2)}</span>
                {' '}from {fromAccount?.name}
              </p>
              <p>
                <span className="text-green-600">+ ${parseFloat(formData.amount).toFixed(2)}</span>
                {' '}to {toAccount?.name}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Transfer...' : 'Create Transfer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
