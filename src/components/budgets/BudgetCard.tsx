import { Edit2, Trash2 } from 'lucide-react';
import Card from '../common/Card';
import { CATEGORY_OPTIONS } from '../../constants/categories';

interface BudgetCardProps {
  budget: any;
  onEdit: (budget: any) => void;
  onDelete: (budget: any) => void;
}

const BudgetCard = ({ budget, onEdit, onDelete }: BudgetCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'over':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const percentage = Math.min(budget.percentage || 0, 100);

  // Find the category option to get the emoji label
  const categoryOption = CATEGORY_OPTIONS.find(c => c.value === budget.category_id);
  const categoryLabel = categoryOption?.label || budget.category_id || 'Unknown Category';

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">
            {categoryLabel}
          </h3>
          <p className="text-xs text-gray-500 capitalize">{budget.period}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(budget)}
            className="text-gray-400 hover:text-primary-600"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(budget)}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Spent</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(budget.spent || 0)} of {formatCurrency(budget.amount)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getStatusColor(budget.status)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Remaining</span>
        <span
          className={`font-medium ${
            budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {formatCurrency(budget.remaining || 0)}
        </span>
      </div>

      {budget.status === 'over' && (
        <div className="mt-3 px-3 py-2 bg-red-50 rounded text-xs text-red-800">
          Over budget by {formatCurrency(Math.abs(budget.remaining))}
        </div>
      )}
    </Card>
  );
};

export default BudgetCard;
