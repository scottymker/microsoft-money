import { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, format, addDays, isBefore } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { getAccounts, getAccountBalanceSummary } from '../services/accounts.service';
import { getTransactions } from '../services/transactions.service';
import { getUpcomingReminders } from '../services/reminders.service';
import { getSavingsGoals } from '../services/goals.service';
import { getNetWorthSnapshots } from '../services/networth.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import { Plus, ArrowRight, Bell, Target, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<any[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);
  const [netWorthSnapshots, setNetWorthSnapshots] = useState<any[]>([]);
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

      const [accountsData, summary, allTransactions, monthTransactions, reminders, goals, snapshots] = await Promise.all([
        getAccounts(true),
        getAccountBalanceSummary(),
        getTransactions(),
        getTransactions({
          dateRange: {
            start: monthStart,
            end: monthEnd,
          },
        }),
        getUpcomingReminders(30).catch(() => []),
        getSavingsGoals().catch(() => []),
        getNetWorthSnapshots().catch(() => []),
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

      // Set widget data (limit to 5 items each)
      setUpcomingReminders(reminders.slice(0, 5));
      setSavingsGoals(goals.filter((g: any) => !g.is_completed).slice(0, 3));
      setNetWorthSnapshots(snapshots.slice(-6)); // Last 6 months
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

      {/* New Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Upcoming Bills & Reminders */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-600" />
              <h2 className="text-lg font-bold text-gray-900">Upcoming Bills</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/reminders')}>
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {upcomingReminders.length === 0 ? (
            <p className="text-gray-500 text-center py-6 text-sm">
              No upcoming reminders
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingReminders.map((reminder: any) => {
                const dueDate = new Date(reminder.due_date);
                const isOverdue = isBefore(dueDate, new Date()) && !reminder.is_paid;
                const isDueSoon = isBefore(dueDate, addDays(new Date(), 7)) && !reminder.is_paid;

                return (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{reminder.title}</p>
                      <p className="text-xs text-gray-500">
                        {format(dueDate, 'MMM d, yyyy')}
                        {reminder.is_paid && (
                          <span className="ml-2 text-green-600">✓ Paid</span>
                        )}
                        {isOverdue && !reminder.is_paid && (
                          <span className="ml-2 text-red-600">Overdue</span>
                        )}
                        {isDueSoon && !reminder.is_paid && !isOverdue && (
                          <span className="ml-2 text-yellow-600">Due Soon</span>
                        )}
                      </p>
                    </div>
                    {reminder.amount && (
                      <p className="font-semibold text-sm text-gray-900">
                        {formatCurrency(Math.abs(reminder.amount))}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Savings Goals */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Savings Goals</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/goals')}>
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {savingsGoals.length === 0 ? (
            <p className="text-gray-500 text-center py-6 text-sm">
              No active goals
            </p>
          ) : (
            <div className="space-y-4">
              {savingsGoals.map((goal: any) => {
                const progress = (goal.current_amount / goal.target_amount) * 100;
                return (
                  <div key={goal.id}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-gray-900 text-sm">{goal.name}</p>
                      <p className="text-xs text-gray-600">
                        {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                      </p>
                    </div>
                    <ProgressBar
                      current={goal.current_amount}
                      target={goal.target_amount}
                      color={goal.color || '#3B82F6'}
                      showPercentage={false}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {progress.toFixed(0)}% complete
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Net Worth Trend */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">Net Worth Trend</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/networth')}>
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {netWorthSnapshots.length === 0 ? (
            <p className="text-gray-500 text-center py-6 text-sm">
              No snapshots yet
            </p>
          ) : (
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Current Net Worth</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.netWorth)}
                </p>
              </div>
              <div className="space-y-2">
                {netWorthSnapshots.slice(-3).reverse().map((snapshot: any) => {
                  const change = snapshot.net_worth - (netWorthSnapshots[netWorthSnapshots.indexOf(snapshot) - 1]?.net_worth || snapshot.net_worth);
                  return (
                    <div
                      key={snapshot.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <p className="text-sm text-gray-600">
                        {format(new Date(snapshot.snapshot_date), 'MMM yyyy')}
                      </p>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(snapshot.net_worth)}
                        </p>
                        {change !== 0 && (
                          <p className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change > 0 ? '+' : ''}{formatCurrency(change)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
