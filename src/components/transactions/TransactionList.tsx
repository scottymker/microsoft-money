import type { Transaction } from '../../types';
import { format } from 'date-fns';
import { Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  accountsMap: Map<string, string>;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onToggleReconciled: (transaction: Transaction) => void;
}

const TransactionList = ({
  transactions,
  accountsMap,
  onEdit,
  onDelete,
  onToggleReconciled,
}: TransactionListProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  if (transactions.length === 0) {
    return (
      <div className="card">
        <p className="text-gray-500 text-center py-8">
          No transactions found. Add a transaction or import from CSV.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Account
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Payee
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Memo
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Amount
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">
                {format(new Date(transaction.date + 'T00:00:00'), 'MMM d, yyyy')}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {accountsMap.get(transaction.account_id) || 'Unknown'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {transaction.payee}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {transaction.category}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {transaction.memo || '--'}
              </td>
              <td
                className={`px-4 py-3 text-sm text-right font-medium ${
                  transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.amount >= 0 ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onToggleReconciled(transaction)}
                    className="text-gray-400 hover:text-primary-600"
                    title={
                      transaction.reconciled
                        ? 'Mark as unreconciled'
                        : 'Mark as reconciled'
                    }
                  >
                    {transaction.reconciled ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => onEdit(transaction)}
                    className="text-gray-400 hover:text-primary-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(transaction)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
