import type { CSVColumnMapping } from '../../types';
import Select from '../common/Select';
import Button from '../common/Button';
import Card from '../common/Card';

interface ColumnMapperProps {
  headers: string[];
  mapping: CSVColumnMapping;
  onMappingChange: (mapping: CSVColumnMapping) => void;
  onContinue: () => void;
  onCancel: () => void;
}

const ColumnMapper = ({
  headers,
  mapping,
  onMappingChange,
  onContinue,
  onCancel,
}: ColumnMapperProps) => {
  const columnOptions = [
    { value: '', label: '-- Skip Column --' },
    ...headers.map((h) => ({ value: h, label: h })),
  ];

  // Valid if we have date, payee, and either amount OR both debit+credit
  const hasAmount = mapping.amount || (mapping.debit && mapping.credit);
  const isValid = mapping.date && hasAmount && mapping.payee;

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Map CSV Columns</h2>
      <p className="text-gray-600 mb-6">
        Match your CSV columns to the required fields
      </p>

      <div className="space-y-4 mb-6">
        <Select
          label="Date Column"
          value={mapping.date || ''}
          onChange={(e) => onMappingChange({ ...mapping, date: e.target.value || undefined })}
          options={columnOptions}
          required
        />

        <div className="border-l-4 border-blue-500 bg-blue-50 p-3 mb-2">
          <p className="text-sm text-blue-900 font-medium">Amount Mapping Options:</p>
          <p className="text-xs text-blue-700 mt-1">
            Map either a single Amount column OR both Debit and Credit columns
          </p>
        </div>

        <Select
          label="Amount Column (for single amount column)"
          value={mapping.amount || ''}
          onChange={(e) => onMappingChange({
            ...mapping,
            amount: e.target.value || undefined,
            // Clear debit/credit if amount is selected
            ...(e.target.value ? { debit: undefined, credit: undefined } : {})
          })}
          options={columnOptions}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Debit Column (expenses)"
            value={mapping.debit || ''}
            onChange={(e) => onMappingChange({
              ...mapping,
              debit: e.target.value || undefined,
              // Clear amount if debit is selected
              ...(e.target.value ? { amount: undefined } : {})
            })}
            options={columnOptions}
          />

          <Select
            label="Credit Column (income)"
            value={mapping.credit || ''}
            onChange={(e) => onMappingChange({
              ...mapping,
              credit: e.target.value || undefined,
              // Clear amount if credit is selected
              ...(e.target.value ? { amount: undefined } : {})
            })}
            options={columnOptions}
          />
        </div>

        <Select
          label="Payee/Description Column"
          value={mapping.payee || ''}
          onChange={(e) => onMappingChange({ ...mapping, payee: e.target.value || undefined })}
          options={columnOptions}
          required
        />

        <Select
          label="Memo Column (Optional)"
          value={mapping.memo || ''}
          onChange={(e) => onMappingChange({ ...mapping, memo: e.target.value || undefined })}
          options={columnOptions}
        />

        <Select
          label="Category Column (Optional)"
          value={mapping.category || ''}
          onChange={(e) => onMappingChange({ ...mapping, category: e.target.value || undefined })}
          options={columnOptions}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} fullWidth>
          Cancel
        </Button>
        <Button onClick={onContinue} disabled={!isValid} fullWidth>
          Continue to Preview
        </Button>
      </div>
    </Card>
  );
};

export default ColumnMapper;
