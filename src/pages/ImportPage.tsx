import { Upload } from 'lucide-react';

const ImportPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Import CSV</h1>

      <div className="card">
        <div className="text-center py-12">
          <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Import Bank Statements
          </h2>
          <p className="text-gray-600 mb-6">
            Upload a CSV file from your bank to import transactions
          </p>
          <button className="btn-primary">Choose CSV File</button>

          <div className="mt-8 text-left max-w-md mx-auto">
            <h3 className="font-semibold text-gray-900 mb-2">
              Supported formats:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• CSV files with date, amount, and payee columns</li>
              <li>• Automatic duplicate detection</li>
              <li>• Smart category assignment based on previous transactions</li>
              <li>• Column mapping for different bank formats</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPage;
