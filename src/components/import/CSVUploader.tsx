import { useRef } from 'react';
import { Upload } from 'lucide-react';
import Button from '../common/Button';

interface CSVUploaderProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
}

const CSVUploader = ({ onFileSelect, loading }: CSVUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      onFileSelect(file);
    } else if (file) {
      alert('Please select a CSV file');
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="text-center">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h3>
        <p className="text-gray-600 mb-4">
          Select a CSV file from your bank to import transactions
        </p>
        <Button
          onClick={() => fileInputRef.current?.click()}
          loading={loading}
        >
          Choose File
        </Button>
      </div>
    </div>
  );
};

export default CSVUploader;
