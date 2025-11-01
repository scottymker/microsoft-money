import { useState } from 'react';
import type { CSVImportRow } from '../../types';
import { format } from 'date-fns';
import Button from '../common/Button';
import Card from '../common/Card';
import Select from '../common/Select';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ImportPreviewProps {
  rows: CSVImportRow[];
  accountId: string;
  accountOptions: { value: string; label: string }[];
  onAccountChange: (accountId: string) => void;
  onImport: (selectedRows: CSVImportRow[]) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ImportPreview = ({
  rows,
  accountId,
  accountOptions,
  onAccountChange,
  onImport,
  onCancel,
  loading,
}: ImportPreviewProps) => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(
    new Set(rows.map((_, i) => i).filter((i) => !rows[i].isDuplicate))
  );

  const toggleRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const toggleAll = () => {
    if (selectedRows.size === rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rows.map((_, i) => i)));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleImport = () => {
    const selected = rows.filter((_, i) => selectedRows.has(i));
    onImport(selected);
  };

  const duplicateCount = rows.filter((r) => r.isDuplicate).length;
  const selectedCount = selectedRows.size;

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Import Preview</h2>

        <Select
          label="Import to Account"
          value={accountId}
          onChange={(e) => onAccountChange(e.target.value)}
          options={accountOptions}
          required
        />

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />
            {selectedCount} selected
          </div>
          {duplicateCount > 0 && (
            <div className="flex items-center text-sm text-yellow-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              {duplicateCount} possible duplicates
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === rows.length}
                    onChange={toggleAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payee
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className={`${
                    row.isDuplicate ? 'bg-yellow-50' : ''
                  } hover:bg-gray-50`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(index)}
                      onChange={() => toggleRow(index)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {format(new Date(row.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.payee}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {row.category || '--'}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm text-right ${
                      row.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(row.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.isDuplicate && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded">
                        Duplicate
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onCancel} fullWidth>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedCount === 0 || !accountId}
            loading={loading}
            fullWidth
          >
            Import {selectedCount} Transaction{selectedCount !== 1 ? 's' : ''}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ImportPreview;
