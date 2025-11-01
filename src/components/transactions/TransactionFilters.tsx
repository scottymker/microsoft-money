import type { FilterOptions } from '../../types';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { X } from 'lucide-react';

interface TransactionFiltersProps {
  filters: FilterOptions;
  accountOptions: { value: string; label: string }[];
  onFiltersChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

const TransactionFilters = ({
  filters,
  accountOptions,
  onFiltersChange,
  onReset,
}: TransactionFiltersProps) => {
  const handleAccountChange = (accountId: string) => {
    onFiltersChange({
      ...filters,
      accountIds: accountId ? [accountId] : undefined,
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const dateRange = filters.dateRange || { start: new Date(), end: new Date() };
    onFiltersChange({
      ...filters,
      dateRange: {
        ...dateRange,
        [field]: new Date(value),
      },
    });
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      searchTerm: value || undefined,
    });
  };

  const hasActiveFilters =
    filters.accountIds?.length ||
    filters.dateRange ||
    filters.searchTerm;

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <Button size="sm" variant="ghost" onClick={onReset}>
            <X className="w-4 h-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          label="Account"
          value={filters.accountIds?.[0] || ''}
          onChange={(e) => handleAccountChange(e.target.value)}
          options={[
            { value: '', label: 'All Accounts' },
            ...accountOptions,
          ]}
        />

        <Input
          label="Search"
          type="text"
          value={filters.searchTerm || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search payee or memo..."
        />

        <Input
          label="Start Date"
          type="date"
          value={
            filters.dateRange?.start
              ? filters.dateRange.start.toISOString().split('T')[0]
              : ''
          }
          onChange={(e) => handleDateRangeChange('start', e.target.value)}
        />

        <Input
          label="End Date"
          type="date"
          value={
            filters.dateRange?.end
              ? filters.dateRange.end.toISOString().split('T')[0]
              : ''
          }
          onChange={(e) => handleDateRangeChange('end', e.target.value)}
        />
      </div>
    </div>
  );
};

export default TransactionFilters;
