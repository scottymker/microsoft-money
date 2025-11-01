import { useState, useEffect } from 'react';
import type { RecurringTransaction, Account } from '../types';
import {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringActive,
  processRecurringTransactions
} from '../services/recurring.service';
import { getAccounts } from '../services/accounts.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/ToastContainer';
import { Plus, Edit, Trash2, Power, RefreshCw } from 'lucide-react';
import { CATEGORY_OPTIONS } from '../constants/categories';

export default function RecurringPage() {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    account_id: '',
    frequency: 'monthly' as RecurringTransaction['frequency'],
    next_date: new Date().toISOString().split('T')[0],
    end_date: '',
    amount: '',
    payee: '',
    category: '',
    subcategory: '',
    memo: '',
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recurringData, accountsData] = await Promise.all([
        getRecurringTransactions(),
        getAccounts()
      ]);
      setRecurring(recurringData);
      setAccounts(accountsData.filter(a => a.is_active));
    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        end_date: formData.end_date || undefined,
        subcategory: formData.subcategory || undefined,
        memo: formData.memo || undefined
      };

      if (editingId) {
        await updateRecurringTransaction(editingId, data);
        showToast('Recurring transaction updated', 'success');
      } else {
        await createRecurringTransaction(data);
        showToast('Recurring transaction created', 'success');
      }

      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      showToast(error.message || 'Failed to save recurring transaction', 'error');
    }
  };

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingId(transaction.id);
    setFormData({
      account_id: transaction.account_id,
      frequency: transaction.frequency,
      next_date: transaction.next_date,
      end_date: transaction.end_date || '',
      amount: transaction.amount.toString(),
      payee: transaction.payee,
      category: transaction.category,
      subcategory: transaction.subcategory || '',
      memo: transaction.memo || '',
      is_active: transaction.is_active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return;

    try {
      await deleteRecurringTransaction(id);
      showToast('Recurring transaction deleted', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to delete recurring transaction', 'error');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleRecurringActive(id);
      showToast('Status updated', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleProcessAll = async () => {
    setProcessing(true);
    try {
      const created = await processRecurringTransactions();
      showToast(`Created ${created.length} transaction(s)`, 'success');
      loadData();
    } catch (error) {
      showToast('Failed to process recurring transactions', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      account_id: '',
      frequency: 'monthly',
      next_date: new Date().toISOString().split('T')[0],
      end_date: '',
      amount: '',
      payee: '',
      category: '',
      subcategory: '',
      memo: '',
      is_active: true
    });
    setEditingId(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Recurring Transactions</h1>
          <p className="text-gray-600 mt-1">Manage automatic scheduled transactions</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleProcessAll}
            variant="secondary"
            disabled={processing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
            Process Now
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Recurring
          </Button>
        </div>
      </div>

      {recurring.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No recurring transactions yet.</p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Recurring Transaction
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recurring.map((transaction) => {
            const account = accounts.find(a => a.id === transaction.account_id);
            return (
              <Card key={transaction.id} className={`p-4 ${!transaction.is_active ? 'opacity-60' : ''}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{transaction.payee}</h3>
                      {!transaction.is_active && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">Inactive</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{transaction.category}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Account: {account?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Frequency: {transaction.frequency} • Next: {transaction.next_date}
                      {transaction.end_date && ` • Ends: ${transaction.end_date}`}
                    </p>
                    {transaction.memo && (
                      <p className="text-sm text-gray-500 mt-1">{transaction.memo}</p>
                    )}
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <p className={`text-xl font-semibold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(transaction.id)}
                      >
                        <Power className={`h-4 w-4 ${transaction.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingId ? 'Edit Recurring Transaction' : 'New Recurring Transaction'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Account"
            value={formData.account_id}
            onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
            options={[
              { value: '', label: 'Select account' },
              ...accounts.map((account) => ({
                value: account.id,
                label: account.name
              }))
            ]}
            required
          />

          <Input
            label="Payee"
            value={formData.payee}
            onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
            required
          />

          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="Negative for expenses"
            required
          />

          <Select
            label="Frequency"
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
            options={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'bi-weekly', label: 'Bi-weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'yearly', label: 'Yearly' }
            ]}
            required
          />

          <Input
            label="Next Date"
            type="date"
            value={formData.next_date}
            onChange={(e) => setFormData({ ...formData, next_date: e.target.value })}
            required
          />

          <Input
            label="End Date (optional)"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />

          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={[{ value: '', label: 'Select category' }, ...CATEGORY_OPTIONS]}
            required
          />

          <Input
            label="Memo (optional)"
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
