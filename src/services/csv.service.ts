import Papa from 'papaparse';
import type { CSVColumnMapping, CSVImportRow } from '../types';

export interface ParsedCSVData {
  headers: string[];
  rows: any[];
}

/**
 * Parse CSV file and return headers and rows
 */
export const parseCSVFile = (file: File): Promise<ParsedCSVData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        resolve({
          headers,
          rows: results.data,
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
};

/**
 * Map CSV rows to import format based on column mapping
 */
export const mapCSVRows = (
  rows: any[],
  mapping: CSVColumnMapping
): CSVImportRow[] => {
  return rows.map((row) => {
    const date = mapping.date ? row[mapping.date] : '';
    const amountStr = mapping.amount ? row[mapping.amount] : '0';
    const payee = mapping.payee ? row[mapping.payee] : 'Unknown';
    const memo = mapping.memo ? row[mapping.memo] : undefined;
    const category = mapping.category ? row[mapping.category] : undefined;

    // Parse amount - handle various formats
    const amount = parseAmount(amountStr);

    // Parse date - handle various formats
    const parsedDate = parseDate(date);

    return {
      date: parsedDate,
      amount,
      payee: payee.trim(),
      memo: memo?.trim(),
      category: category?.trim(),
    };
  });
};

/**
 * Parse amount string to number
 * Handles: $1,234.56, (1234.56), -1234.56, etc.
 */
const parseAmount = (amountStr: string): number => {
  if (!amountStr) return 0;

  // Remove currency symbols, spaces, and commas
  let cleaned = amountStr.toString().trim();
  cleaned = cleaned.replace(/[$€£¥,\s]/g, '');

  // Handle parentheses as negative (common in accounting)
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    cleaned = '-' + cleaned.slice(1, -1);
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

/**
 * Parse date string to ISO format
 * Handles: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, etc.
 */
const parseDate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split('T')[0];

  // Try to parse the date
  const date = new Date(dateStr);

  // If invalid, try common formats
  if (isNaN(date.getTime())) {
    // Try MM/DD/YYYY
    const parts = dateStr.split(/[/-]/);
    if (parts.length === 3) {
      const [first, second, third] = parts;

      // If third part is 4 digits, it's the year
      if (third.length === 4) {
        // Assume MM/DD/YYYY
        const testDate = new Date(`${third}-${first}-${second}`);
        if (!isNaN(testDate.getTime())) {
          return testDate.toISOString().split('T')[0];
        }
      }
    }
  }

  return date.toISOString().split('T')[0];
};

/**
 * Detect duplicates in import data
 * Matches on: date + amount + payee
 */
export const detectDuplicates = (
  importRows: CSVImportRow[],
  existingTransactions: { date: string; amount: number; payee: string }[]
): CSVImportRow[] => {
  const existingSet = new Set(
    existingTransactions.map((t) =>
      `${t.date}|${t.amount}|${t.payee.toLowerCase()}`
    )
  );

  return importRows.map((row) => ({
    ...row,
    isDuplicate: existingSet.has(
      `${row.date}|${row.amount}|${row.payee.toLowerCase()}`
    ),
  }));
};

/**
 * Auto-assign categories based on previous transactions
 */
export const autoAssignCategories = (
  importRows: CSVImportRow[],
  existingTransactions: { payee: string; category: string }[]
): CSVImportRow[] => {
  // Build payee -> category map from existing transactions
  const payeeCategoryMap = new Map<string, string>();

  existingTransactions.forEach((t) => {
    const normalizedPayee = t.payee.toLowerCase().trim();
    if (t.category && !payeeCategoryMap.has(normalizedPayee)) {
      payeeCategoryMap.set(normalizedPayee, t.category);
    }
  });

  // Assign categories to import rows
  return importRows.map((row) => {
    if (!row.category) {
      const normalizedPayee = row.payee.toLowerCase().trim();
      const matchedCategory = payeeCategoryMap.get(normalizedPayee);

      if (matchedCategory) {
        return { ...row, category: matchedCategory };
      }
    }
    return row;
  });
};

/**
 * Export transactions to CSV
 */
export const exportToCSV = (
  transactions: any[],
  filename: string = 'transactions.csv'
) => {
  const csv = Papa.unparse(transactions);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
