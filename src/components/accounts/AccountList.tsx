import type { Account } from '../../types';
import { Building2, CreditCard, PiggyBank, TrendingUp, Wallet, Edit2, Trash2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

interface AccountListProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

const AccountList = ({ accounts, onEdit, onDelete }: AccountListProps) => {
  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return Building2;
      case 'savings':
        return PiggyBank;
      case 'credit':
        return CreditCard;
      case 'investment':
        return TrendingUp;
      case 'cash':
        return Wallet;
      default:
        return Building2;
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking':
        return 'Checking';
      case 'savings':
        return 'Savings';
      case 'credit':
        return 'Credit Card';
      case 'investment':
        return 'Investment';
      case 'cash':
        return 'Cash';
      default:
        return type;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (accounts.length === 0) {
    return (
      <Card>
        <p className="text-gray-500 text-center py-8">
          No accounts yet. Create your first account to get started.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => {
        const Icon = getAccountIcon(account.type);
        const isNegative = account.balance < 0;

        return (
          <Card key={account.id} className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{account.name}</h3>
                  <p className="text-xs text-gray-500">
                    {getAccountTypeLabel(account.type)}
                    {account.account_number && ` •••• ${account.account_number}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Current Balance</p>
              <p
                className={`text-2xl font-bold ${
                  isNegative ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                {formatCurrency(account.balance)}
              </p>
            </div>

            {account.institution && (
              <p className="text-xs text-gray-500 mb-3">{account.institution}</p>
            )}

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(account)}
                className="flex-1"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(account)}
                className="flex-1 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default AccountList;
