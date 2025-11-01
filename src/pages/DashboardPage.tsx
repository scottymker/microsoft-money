import { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { getAccounts, getAccountBalanceSummary } from '../services/accounts.service';
import { getTransactions } from '../services/transactions.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Plus, ArrowRight } from 'lucide-react';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBalance: 0,
    monthIncome: 0,
    monthExpenses: 0,
    netWorth: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const [accountsData, summary, allTransactions, monthTransactions] = await Promise.all([
        getAccounts(true),
        getAccountBalanceSummary(),
        getTransactions(),
        getTransactions({
          dateRange: {
            start: monthStart,
            end: monthEnd,
          },
        }),
      ]);

      setAccounts(accountsData);

      // Calculate month income/expenses
      const monthIncome = monthTransactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      const monthExpenses = monthTransactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      setStats({
        totalBalance: summary.totalAssets - summary.totalLiabilities,
        monthIncome,
        monthExpenses,
        netWorth: summary.netWorth,
      });

      // Get recent 5 transactions
      setRecentTransactions(allTransactions.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/import')}>
            Import CSV
          </Button>
          <Button onClick={() => navigate('/transactions')}>
            <Plus className="w-5 h-5 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Quick stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Total Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.totalBalance)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">This Month Income</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.monthIncome)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">This Month Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(stats.monthExpenses)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Net Worth</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.netWorth)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/transactions')}
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No transactions yet. Import a CSV file or add transactions manually.
            </p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{transaction.payee}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(transaction.date), 'MMM d, yyyy')} •{' '}
                      {transaction.category}
                    </p>
                  </div>
                  <p
                    className={`font-semibold ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.amount >= 0 ? '+' : ''}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Account balances */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Account Balances</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/accounts')}>
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {accounts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No accounts yet. Create your first account to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{account.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                  </div>
                  <p
                    className={`font-semibold ${
                      account.balance >= 0 ? 'text-gray-900' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
