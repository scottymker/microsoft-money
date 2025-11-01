import { useState, useEffect } from 'react';
import { Plus, ArrowLeftRight } from 'lucide-react';
import type { Transaction, FilterOptions } from '../types';
import { getAccounts } from '../services/accounts.service';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  toggleReconciled,
} from '../services/transactions.service';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/ToastContainer';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionList from '../components/transactions/TransactionList';
import TransactionFilters from '../components/transactions/TransactionFilters';
import ExportButton from '../components/export/ExportButton';
import TransferForm from '../components/transfers/TransferForm';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [stats, setStats] = useState({ income: 0, expenses: 0, net: 0 });
  const [showTransferModal, setShowTransferModal] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsData, accountsData] = await Promise.all([
        getTransactions(filters),
        getAccounts(true),
      ]);
      setTransactions(transactionsData);
      setAccounts(accountsData);

      // Calculate stats
      const income = transactionsData
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactionsData
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      setStats({ income, expenses, net: income - expenses });
    } catch (error) {
      showToast('Failed to load transactions', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedTransaction(undefined);
    setShowModal(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handleDelete = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      setSubmitting(true);
      await deleteTransaction(transactionToDelete.id);
      showToast('Transaction deleted successfully', 'success');
      setShowDeleteConfirm(false);
      setTransactionToDelete(undefined);
      fetchData();
    } catch (error) {
      showToast('Failed to delete transaction', 'error');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (data: Partial<Transaction>) => {
    try {
      setSubmitting(true);
      if (selectedTransaction) {
        await updateTransaction(selectedTransaction.id, data);
        showToast('Transaction updated successfully', 'success');
      } else {
        await createTransaction(data as any);
        showToast('Transaction created successfully', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      showToast('Failed to save transaction', 'error');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferSuccess = () => {
    setShowTransferModal(false);
    fetchData();
  };

  const handleToggleReconciled = async (transaction: Transaction) => {
    try {
      await toggleReconciled(transaction.id);
      showToast(
        `Transaction marked as ${transaction.reconciled ? 'unreconciled' : 'reconciled'}`,
        'success'
      );
      fetchData();
    } catch (error) {
      showToast('Failed to update transaction', 'error');
      console.error(error);
    }
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const accountsMap = new Map(accounts.map((a) => [a.id, a.name]));
  const accountOptions = accounts.map((a) => ({
    value: a.id,
    label: `${a.name} (${a.type})`,
  }));

  if (loading && transactions.length === 0) {
    return <LoadingSpinner text="Loading transactions..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <div className="flex gap-2">
          <ExportButton
            data={transactions}
            filename="transactions"
            variant="secondary"
          />
          <Button onClick={() => setShowTransferModal(true)} variant="secondary">
            <ArrowLeftRight className="w-5 h-5 mr-2" />
            Transfer
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="w-5 h-5 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Total Income</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.income)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.expenses)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 mb-1">Net</p>
          <p className={`text-2xl font-bold ${stats.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(stats.net)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <TransactionFilters
        filters={filters}
        accountOptions={accountOptions}
        onFiltersChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Transactions List */}
      <TransactionList
        transactions={transactions}
        accountsMap={accountsMap}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleReconciled={handleToggleReconciled}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}
      >
        <TransactionForm
          transaction={selectedTransaction}
          accounts={accountOptions}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          loading={submitting}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message={`Are you sure you want to delete this transaction?`}
        confirmText="Delete"
        variant="danger"
        loading={submitting}
      />

      {/* Transfer Modal */}
      <TransferForm
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        accounts={accounts}
        onSuccess={handleTransferSuccess}
      />
    </div>
  );
};

export default TransactionsPage;
