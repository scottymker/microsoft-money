import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Card from '../common/Card';

interface IncomeVsExpenseProps {
  data: { month: string; income: number; expense: number }[];
}

const IncomeVsExpense = ({ data }: IncomeVsExpenseProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
    }).format(value);
  };

  if (data.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Bar dataKey="income" fill="#10b981" name="Income" />
          <Bar dataKey="expense" fill="#ef4444" name="Expenses" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default IncomeVsExpense;
