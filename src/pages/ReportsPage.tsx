import { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { getTransactions } from '../services/transactions.service';
import { ensureDefaultCategories } from '../services/categories.service';
import { exportToCSV } from '../services/csv.service';
import { useToast } from '../components/common/ToastContainer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import SpendingByCategory from '../components/reports/SpendingByCategory';
import IncomeVsExpense from '../components/reports/IncomeVsExpense';
import { Download } from 'lucide-react';

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [allTransactions, setAllTransactions] = useState<any[]>([]);

  const { showToast } = useToast();

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [transactions, categories] = await Promise.all([
        getTransactions({
          dateRange: {
            start: new Date(startDate),
            end: new Date(endDate),
          },
        }),
        ensureDefaultCategories(),
      ]);

      setAllTransactions(transactions);

      // Calculate spending by category
      const categoryMap = new Map(categories.map((c) => [c.name, c.color]));
      const spending = transactions
        .filter((t) => t.amount < 0)
        .reduce((acc, t) => {
          const cat = t.category || 'Uncategorized';
          acc.set(cat, (acc.get(cat) || 0) + Math.abs(t.amount));
          return acc;
        }, new Map());

      const catData = Array.from(spending.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          color: categoryMap.get(category) || '#64748b',
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

      setCategoryData(catData);

      // Calculate monthly income vs expenses
      const monthlyMap = new Map();
      transactions.forEach((t) => {
        const month = format(new Date(t.date), 'MMM yyyy');
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, { month, income: 0, expense: 0 });
        }
        const data = monthlyMap.get(month);
        if (t.amount > 0) {
          data.income += t.amount;
        } else {
          data.expense += Math.abs(t.amount);
        }
      });

      setMonthlyData(Array.from(monthlyMap.values()));
    } catch (error) {
      showToast('Failed to load report data', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const exportData = allTransactions.map((t) => ({
        Date: t.date,
        Account: t.account_id,
        Payee: t.payee,
        Category: t.category,
        Memo: t.memo || '',
        Amount: t.amount,
        Reconciled: t.reconciled ? 'Yes' : 'No',
      }));
      exportToCSV(exportData, `transactions_${startDate}_to_${endDate}.csv`);
      showToast('Report exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export report', 'error');
      console.error(error);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading reports..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <Button onClick={handleExport}>
          <Download className="w-5 h-5 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Date Range Filter */}
      <div className="card mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingByCategory data={categoryData} />
        <IncomeVsExpense data={monthlyData} />
      </div>
    </div>
  );
};

export default ReportsPage;
