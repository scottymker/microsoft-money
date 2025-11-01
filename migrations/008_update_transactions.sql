-- Migration: Update transactions table
-- Feature 2: Transfer Between Accounts
-- Feature 1: Recurring/Scheduled Transactions

-- Add new columns to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(20) CHECK (transaction_type IN ('income', 'expense', 'transfer')),
ADD COLUMN IF NOT EXISTS linked_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS recurring_transaction_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL;

-- Create index for linked transactions (transfers)
CREATE INDEX IF NOT EXISTS idx_transactions_linked ON transactions(linked_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON transactions(recurring_transaction_id);

-- Update existing transactions to set transaction_type based on amount
UPDATE transactions
SET transaction_type = CASE
  WHEN amount >= 0 THEN 'income'
  ELSE 'expense'
END
WHERE transaction_type IS NULL;

-- Note: Transfer transactions will be created with transaction_type = 'transfer'
-- and linked_transaction_id pointing to the corresponding transaction in the other account
