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

  const isValid = mapping.date && mapping.amount && mapping.payee;

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

        <Select
          label="Amount Column"
          value={mapping.amount || ''}
          onChange={(e) => onMappingChange({ ...mapping, amount: e.target.value || undefined })}
          options={columnOptions}
          required
        />

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
