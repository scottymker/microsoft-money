import { useState, useEffect } from 'react';
import type { CSVColumnMapping, CSVImportRow } from '../types';
import { getAccounts } from '../services/accounts.service';
import { getTransactions, createTransactionsBulk } from '../services/transactions.service';
import {
  parseCSVFile,
  mapCSVRows,
  detectDuplicates,
  autoAssignCategories,
} from '../services/csv.service';
import { useToast } from '../components/common/ToastContainer';
import CSVUploader from '../components/import/CSVUploader';
import ColumnMapper from '../components/import/ColumnMapper';
import ImportPreview from '../components/import/ImportPreview';

type Step = 'upload' | 'map' | 'preview';

const ImportPage = () => {
  const [step, setStep] = useState<Step>('upload');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState<CSVColumnMapping>({});
  const [importRows, setImportRows] = useState<CSVImportRow[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await getAccounts(true);
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccountId(data[0].id);
      }
    } catch (error) {
      showToast('Failed to load accounts', 'error');
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setLoading(true);
      const { headers, rows } = await parseCSVFile(file);
      setCsvHeaders(headers);
      setCsvRows(rows);

      // Auto-detect common column names
      const autoMapping: CSVColumnMapping = {};
      const lowerHeaders = headers.map((h) => h.toLowerCase());

      const dateIndex = lowerHeaders.findIndex((h) =>
        ['date', 'posted date', 'transaction date'].some((d) => h.includes(d))
      );
      const amountIndex = lowerHeaders.findIndex((h) =>
        ['amount', 'debit', 'credit'].some((a) => h.includes(a))
      );
      const payeeIndex = lowerHeaders.findIndex((h) =>
        ['payee', 'description', 'merchant', 'name'].some((p) => h.includes(p))
      );
      const memoIndex = lowerHeaders.findIndex((h) =>
        ['memo', 'note', 'details'].some((m) => h.includes(m))
      );

      if (dateIndex >= 0) autoMapping.date = headers[dateIndex];
      if (amountIndex >= 0) autoMapping.amount = headers[amountIndex];
      if (payeeIndex >= 0) autoMapping.payee = headers[payeeIndex];
      if (memoIndex >= 0) autoMapping.memo = headers[memoIndex];

      setMapping(autoMapping);
      setStep('map');
      showToast('CSV file uploaded successfully', 'success');
    } catch (error) {
      showToast('Failed to parse CSV file', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToPreview = async () => {
    try {
      setLoading(true);

      // Map CSV rows to import format
      let mapped = mapCSVRows(csvRows, mapping);

      // Get existing transactions for duplicate detection
      const existingTransactions = await getTransactions();

      // Detect duplicates
      mapped = detectDuplicates(mapped, existingTransactions);

      // Auto-assign categories
      mapped = autoAssignCategories(mapped, existingTransactions);

      setImportRows(mapped);
      setStep('preview');
    } catch (error) {
      showToast('Failed to process CSV data', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (rows: CSVImportRow[]) => {
    try {
      setLoading(true);

      const transactions = rows.map((row) => ({
        account_id: selectedAccountId,
        date: row.date,
        amount: row.amount,
        payee: row.payee,
        category: row.category || 'Uncategorized',
        memo: row.memo,
        reconciled: false,
      }));

      await createTransactionsBulk(transactions as any);
      showToast(`Successfully imported ${rows.length} transactions`, 'success');

      // Reset state
      setStep('upload');
      setCsvHeaders([]);
      setCsvRows([]);
      setMapping({});
      setImportRows([]);
    } catch (error) {
      showToast('Failed to import transactions', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStep('upload');
    setCsvHeaders([]);
    setCsvRows([]);
    setMapping({});
    setImportRows([]);
  };

  const accountOptions = accounts.map((acc) => ({
    value: acc.id,
    label: `${acc.name} (${acc.type})`,
  }));

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Import CSV</h1>

      {step === 'upload' && (
        <CSVUploader onFileSelect={handleFileSelect} loading={loading} />
      )}

      {step === 'map' && (
        <ColumnMapper
          headers={csvHeaders}
          mapping={mapping}
          onMappingChange={setMapping}
          onContinue={handleContinueToPreview}
          onCancel={handleCancel}
        />
      )}

      {step === 'preview' && (
        <ImportPreview
          rows={importRows}
          accountId={selectedAccountId}
          accountOptions={accountOptions}
          onAccountChange={setSelectedAccountId}
          onImport={handleImport}
          onCancel={handleCancel}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ImportPage;
