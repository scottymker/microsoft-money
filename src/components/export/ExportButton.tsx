import { useState } from 'react';
import Button from '../common/Button';
import { Download } from 'lucide-react';
import { unparse } from 'papaparse';
import { useToast } from '../common/ToastContainer';

interface ExportButtonProps {
  data: any[];
  filename: string;
  columns?: string[];
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable export button component that converts data to CSV and downloads it
 * Used across Transactions, Reports, and Budgets pages
 */
export default function ExportButton({
  data,
  filename,
  columns,
  label = 'Export CSV',
  variant = 'outline',
  size = 'sm'
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleExport = () => {
    try {
      setLoading(true);

      if (!data || data.length === 0) {
        showToast('No data to export', 'error');
        return;
      }

      // Filter columns if specified
      const exportData = columns
        ? data.map(row => {
            const filtered: any = {};
            columns.forEach(col => {
              filtered[col] = row[col];
            });
            return filtered;
          })
        : data;

      // Convert to CSV using PapaParse
      const csv = unparse(exportData);

      // Create download link
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Exported ${data.length} row(s) successfully`, 'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Failed to export data', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={loading || !data || data.length === 0}
      variant={variant === 'outline' ? 'secondary' : variant}
      size={size}
    >
      <Download className="h-4 w-4 mr-2" />
      {loading ? 'Exporting...' : label}
    </Button>
  );
}
