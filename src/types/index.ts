// Core data types for the personal finance app

export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'cash';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type CategoryType = 'income' | 'expense';

export type BudgetPeriod = 'monthly' | 'annual';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  opening_balance: number;
  currency: string;
  institution?: string;
  account_number?: string; // last 4 digits only for security
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  date: string;
  amount: number; // negative for expenses, positive for income
  payee: string;
  category: string;
  subcategory?: string;
  memo?: string;
  reconciled: boolean;
  splits?: TransactionSplit[];
  import_id?: string; // for duplicate detection
  created_at: string;
  updated_at: string;
}

export interface TransactionSplit {
  category: string;
  subcategory?: string;
  amount: number;
  memo?: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  parent_id?: string; // for subcategories
  color: string;
  icon?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  rollover: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

// CSV Import types
export interface CSVColumnMapping {
  date?: string;
  amount?: string;
  payee?: string;
  memo?: string;
  category?: string;
}

export interface CSVImportRow {
  date: string;
  amount: number;
  payee: string;
  memo?: string;
  category?: string;
  isDuplicate?: boolean;
}

// UI State types
export interface DateRange {
  start: Date;
  end: Date;
}

export interface FilterOptions {
  accountIds?: string[];
  categoryIds?: string[];
  dateRange?: DateRange;
  searchTerm?: string;
  minAmount?: number;
  maxAmount?: number;
  reconciled?: boolean;
}

// Chart data types
export interface SpendingByCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface SpendingTrend {
  date: string;
  income: number;
  expense: number;
  net: number;
}
