-- Migration: Add reconciliation_history table
-- Feature 6: Better Reconciliation Flow

CREATE TABLE IF NOT EXISTS reconciliation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  statement_date DATE NOT NULL,
  statement_beginning_balance DECIMAL(12, 2) NOT NULL,
  statement_ending_balance DECIMAL(12, 2) NOT NULL,
  reconciled_balance DECIMAL(12, 2) NOT NULL,
  difference DECIMAL(12, 2) NOT NULL DEFAULT 0,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_reconciliation_history_user_id ON reconciliation_history(user_id);
CREATE INDEX idx_reconciliation_history_account_id ON reconciliation_history(account_id);
CREATE INDEX idx_reconciliation_history_date ON reconciliation_history(statement_date);

-- Row Level Security
ALTER TABLE reconciliation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reconciliation history"
  ON reconciliation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reconciliation history"
  ON reconciliation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reconciliation history"
  ON reconciliation_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reconciliation history"
  ON reconciliation_history FOR DELETE
  USING (auth.uid() = user_id);

-- Sample data for testing
-- INSERT INTO reconciliation_history (user_id, account_id, statement_date, statement_beginning_balance, statement_ending_balance, reconciled_balance, difference, transaction_count)
-- VALUES
--   ('USER_ID', 'ACCOUNT_ID', '2025-10-31', 5000.00, 4250.00, 4250.00, 0.00, 24),
--   ('USER_ID', 'ACCOUNT_ID', '2025-09-30', 4800.00, 5000.00, 5000.00, 0.00, 19);
