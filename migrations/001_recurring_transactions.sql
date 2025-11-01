-- Migration: Add recurring_transactions table
-- Feature 1: Recurring/Scheduled Transactions

CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly')),
  next_date DATE NOT NULL,
  end_date DATE,
  amount DECIMAL(12, 2) NOT NULL,
  payee VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  memo TEXT,
  is_active BOOLEAN DEFAULT true,
  last_created_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user queries
CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_transactions_next_date ON recurring_transactions(next_date);
CREATE INDEX idx_recurring_transactions_active ON recurring_transactions(is_active);

-- Row Level Security
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recurring transactions"
  ON recurring_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring transactions"
  ON recurring_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions"
  ON recurring_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions"
  ON recurring_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Sample data for testing
-- Note: Replace USER_ID and ACCOUNT_ID with actual values from your database
-- INSERT INTO recurring_transactions (user_id, account_id, frequency, next_date, amount, payee, category, memo)
-- VALUES
--   ('USER_ID', 'ACCOUNT_ID', 'monthly', '2025-11-01', -1200.00, 'Rent Payment', 'Housing', 'Monthly rent'),
--   ('USER_ID', 'ACCOUNT_ID', 'bi-weekly', '2025-11-05', 3500.00, 'Employer', 'Salary', 'Paycheck'),
--   ('USER_ID', 'ACCOUNT_ID', 'monthly', '2025-11-15', -75.00, 'Internet Provider', 'Utilities', 'Internet bill');
