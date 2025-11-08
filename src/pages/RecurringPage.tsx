import { useState, useEffect } from 'react';
import type { Transaction } from '../types';
import { getTransactions, deleteTransaction } from '../services/transactions.service';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/ToastContainer';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function RecurringPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Get all transactions
      const allTransactions = await getTransactions({});
      // Filter only recurring ones
      const recurringTransactions = allTransactions.filter(t => (t as any).recurring === true);
      setTransactions(recurringTransactions);
    } catch (error) {
      showToast('Failed to load recurring transactions', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return;

    try {
      await deleteTransaction(id);
      showToast('Recurring transaction deleted', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to delete transaction', 'error');
      console.error(error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  if (loading) return <LoadingSpinner text="Loading recurring transactions..." />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Recurring Transactions</h1>
        <p className="text-gray-600 mt-1">Transactions marked as recurring</p>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <p className="text-gray-500">No recurring transactions yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Mark transactions as recurring when adding them to see them here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <Card key={transaction.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{transaction.payee}</h3>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                    {transaction.memo && <span>• {transaction.memo}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-lg font-semibold ${
                      transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {transaction.amount < 0 ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </span>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
