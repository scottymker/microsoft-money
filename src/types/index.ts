// Core data types for the personal finance app

export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'retirement' | 'cash';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type CategoryType = 'income' | 'expense';

export type BudgetPeriod = 'monthly' | 'annual';

export type RecurringFrequency = 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';

export type ReminderFrequency = 'one-time' | 'monthly' | 'yearly';

export type AssetType = 'stock' | 'etf' | 'mutual_fund' | 'bond' | 'crypto' | 'other';

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
  transaction_type?: TransactionType;
  linked_transaction_id?: string; // for transfers
  recurring_transaction_id?: string; // link to recurring transaction that created this
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
  debit?: string;    // For CSVs with separate debit/credit columns
  credit?: string;   // For CSVs with separate debit/credit columns
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
  transactionType?: TransactionType;
  multipleCategories?: string[]; // for advanced search with multiple categories
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

// Feature 1: Recurring Transactions
export interface RecurringTransaction {
  id: string;
  user_id: string;
  account_id: string;
  frequency: RecurringFrequency;
  next_date: string;
  end_date?: string;
  amount: number;
  payee: string;
  category: string;
  subcategory?: string;
  memo?: string;
  is_active: boolean;
  last_created_date?: string;
  created_at: string;
  updated_at: string;
}

// Feature 7: Bill Reminders
export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  amount?: number;
  due_date: string;
  frequency?: ReminderFrequency;
  is_paid: boolean;
  linked_transaction_id?: string;
  category?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Feature 8: Net Worth Snapshots
export interface NetWorthSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  created_at: string;
  updated_at: string;
}

// Feature 9: Savings Goals
export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  linked_account_id?: string;
  color: string;
  icon?: string;
  notes?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Feature 10: Saved Filters
export interface SavedFilter {
  id: string;
  user_id: string;
  name: string;
  filter_config: FilterOptions;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

// Feature 12: Investment Holdings
export interface InvestmentHolding {
  id: string;
  user_id: string;
  account_id: string;
  symbol: string;
  name?: string;
  shares: number;
  cost_basis: number;
  current_price?: number;
  last_updated?: string;
  asset_type?: AssetType;
  created_at: string;
  updated_at: string;
}

// Feature 6: Reconciliation History
export interface ReconciliationHistory {
  id: string;
  user_id: string;
  account_id: string;
  statement_date: string;
  statement_beginning_balance: number;
  statement_ending_balance: number;
  reconciled_balance: number;
  difference: number;
  transaction_count: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}
