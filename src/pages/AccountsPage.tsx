import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { Account } from '../types';
import {
  getAccounts,
  getAccountBalanceSummary,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../services/accounts.service';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/ToastContainer';
import AccountForm from '../components/accounts/AccountForm';
import AccountList from '../components/accounts/AccountList';

const AccountsPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const [accountsData, summaryData] = await Promise.all([
        getAccounts(),
        getAccountBalanceSummary(),
      ]);
      setAccounts(accountsData);
      setSummary(summaryData);
    } catch (error) {
      showToast('Failed to load accounts', 'error');
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedAccount(undefined);
    setShowModal(true);
  };

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setShowModal(true);
  };

  const handleDelete = (account: Account) => {
    setAccountToDelete(account);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;

    try {
      setSubmitting(true);
      await deleteAccount(accountToDelete.id);
      showToast('Account deleted successfully', 'success');
      setShowDeleteConfirm(false);
      setAccountToDelete(undefined);
      fetchAccounts();
    } catch (error) {
      showToast('Failed to delete account', 'error');
      console.error('Error deleting account:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (data: Partial<Account>) => {
    try {
      setSubmitting(true);
      if (selectedAccount) {
        await updateAccount(selectedAccount.id, data);
        showToast('Account updated successfully', 'success');
      } else {
        await createAccount(data as any);
        showToast('Account created successfully', 'success');
      }
      setShowModal(false);
      fetchAccounts();
    } catch (error) {
      showToast('Failed to save account', 'error');
      console.error('Error saving account:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return <LoadingSpinner text="Loading accounts..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-5 h-5 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Total Assets</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(summary.totalAssets)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Total Liabilities</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(summary.totalLiabilities)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Net Worth</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.netWorth)}
          </p>
        </Card>
      </div>

      {/* Accounts List */}
      <AccountList accounts={accounts} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedAccount ? 'Edit Account' : 'Create Account'}
      >
        <AccountForm
          account={selectedAccount}
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
        title="Delete Account"
        message={`Are you sure you want to delete "${accountToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={submitting}
      />
    </div>
  );
};

export default AccountsPage;
