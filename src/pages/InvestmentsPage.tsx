import { useState, useEffect } from 'react';
import type { InvestmentHolding, Account } from '../types';
import {
  getInvestmentHoldings,
  createInvestmentHolding,
  updateInvestmentHolding,
  deleteInvestmentHolding,
  calculateHoldingValue,
  calculateHoldingGainLoss
} from '../services/investments.service';
import { getAccounts } from '../services/accounts.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Select from '../components/common/Select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/ToastContainer';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import InvestmentForm from '../components/investments/InvestmentForm';

export default function InvestmentsPage() {
  const [holdings, setHoldings] = useState<InvestmentHolding[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<InvestmentHolding | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [holdingToDelete, setHoldingToDelete] = useState<InvestmentHolding | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (accounts.length > 0) {
      fetchHoldings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId, accounts.length]);

  const loadAccounts = async () => {
    try {
      const data = await getAccounts(true);
      console.log('All accounts loaded:', data.length);
      const investmentAccounts = data.filter(
        acc => acc.type === 'investment' || acc.type === 'retirement'
      );
      console.log('Investment accounts found:', investmentAccounts.length);
      setAccounts(investmentAccounts);
      if (investmentAccounts.length > 0 && !selectedAccountId) {
        setSelectedAccountId('all');
      } else {
        // No investment accounts, stop loading
        console.log('No investment accounts, setting loading to false');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Failed to load accounts:', error);
      showToast(error.message || 'Failed to load accounts', 'error');
      setLoading(false);
    }
  };

  const fetchHoldings = async () => {
    try {
      setLoading(true);
      const accountId = selectedAccountId === 'all' ? undefined : selectedAccountId;
      const data = await getInvestmentHoldings(accountId);
      setHoldings(data);
    } catch (error: any) {
      console.error('Failed to load investment holdings:', error);
      showToast(error.message || 'Failed to load investment holdings', 'error');
      setHoldings([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedHolding(undefined);
    setShowModal(true);
  };

  const handleEdit = (holding: InvestmentHolding) => {
    setSelectedHolding(holding);
    setShowModal(true);
  };

  const handleDelete = (holding: InvestmentHolding) => {
    setHoldingToDelete(holding);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!holdingToDelete) return;

    try {
      await deleteInvestmentHolding(holdingToDelete.id);
      showToast('Holding deleted', 'success');
      setShowDeleteConfirm(false);
      setHoldingToDelete(undefined);
      fetchHoldings();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete holding', 'error');
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (selectedHolding) {
        await updateInvestmentHolding(selectedHolding.id, data);
        showToast('Holding updated', 'success');
      } else {
        await createInvestmentHolding(data);
        showToast('Holding created', 'success');
      }
      setShowModal(false);
      setSelectedHolding(undefined);
      fetchHoldings();
    } catch (error: any) {
      showToast(error.message || 'Failed to save holding', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotals = () => {
    let totalValue = 0;
    let totalCostBasis = 0;
    let totalGainLoss = 0;

    holdings.forEach((holding) => {
      const value = calculateHoldingValue(holding);
      const gainLoss = calculateHoldingGainLoss(holding);
      totalValue += value;
      totalCostBasis += holding.cost_basis;
      totalGainLoss += gainLoss.amount;
    });

    const totalGainLossPercentage = totalCostBasis !== 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

    return { totalValue, totalCostBasis, totalGainLoss, totalGainLossPercentage };
  };

  const totals = calculateTotals();

  if (loading) return <LoadingSpinner text="Loading investments..." />;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Investments</h1>
          <p className="text-gray-600 mt-1">Track your investment portfolio</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Holding
          </Button>
        </div>
      </div>

      {/* Account Filter */}
      {accounts.length > 0 && (
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Account:</label>
            <Select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="flex-1 max-w-md"
              options={[
                { value: 'all', label: 'All Investment Accounts' },
                ...accounts.map((account) => ({
                  value: account.id,
                  label: `${account.name} - $${account.balance.toFixed(2)}`
                }))
              ]}
            />
          </div>
        </Card>
      )}

      {/* Portfolio Summary */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total Value</p>
            <p className="text-xl font-bold text-primary-600">
              ${totals.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Cost Basis</p>
            <p className="text-xl font-bold text-gray-900">
              ${totals.totalCostBasis.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total Gain/Loss</p>
            <p className={`text-xl font-bold flex items-center gap-1 ${totals.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totals.totalGainLoss >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {totals.totalGainLoss >= 0 ? '+' : ''}${Math.abs(totals.totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Return</p>
            <p className={`text-xl font-bold ${totals.totalGainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totals.totalGainLossPercentage >= 0 ? '+' : ''}{totals.totalGainLossPercentage.toFixed(2)}%
            </p>
          </Card>
        </div>
      )}

      {/* No Investment Accounts Warning */}
      {accounts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">
            No investment or retirement accounts found.
          </p>
          <p className="text-sm text-gray-600">
            Please create an investment or retirement account first to track your holdings.
          </p>
        </Card>
      ) : holdings.length === 0 ? (
        <Card className="p-8 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No investment holdings yet.</p>
          <Button onClick={handleCreate} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Holding
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Basis
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gain/Loss
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    %
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {holdings.map((holding) => {
                  const currentValue = calculateHoldingValue(holding);
                  const gainLoss = calculateHoldingGainLoss(holding);
                  const account = accounts.find(a => a.id === holding.account_id);

                  return (
                    <tr key={holding.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{holding.symbol}</div>
                          {holding.asset_type && (
                            <div className="text-xs text-gray-500 capitalize">
                              {holding.asset_type.replace('_', ' ')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{holding.name || '-'}</div>
                          {selectedAccountId === 'all' && account && (
                            <div className="text-xs text-gray-500">{account.name}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {holding.shares.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        ${holding.cost_basis.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {holding.current_price ? (
                          `$${holding.current_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {currentValue > 0 ? (
                          `$${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {currentValue > 0 ? (
                          <span className={gainLoss.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {gainLoss.amount >= 0 ? '+' : ''}${Math.abs(gainLoss.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {currentValue > 0 ? (
                          <span className={gainLoss.percentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {gainLoss.percentage >= 0 ? '+' : ''}{gainLoss.percentage.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(holding)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(holding)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedHolding(undefined);
        }}
        title={selectedHolding ? 'Edit Investment Holding' : 'New Investment Holding'}
      >
        <InvestmentForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setSelectedHolding(undefined);
          }}
          initialData={selectedHolding}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setHoldingToDelete(undefined);
        }}
        onConfirm={confirmDelete}
        title="Delete Holding"
        message={`Are you sure you want to delete ${holdingToDelete?.symbol}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
