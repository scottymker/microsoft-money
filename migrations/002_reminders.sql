-- Migration: Add reminders table
-- Feature 7: Bill Reminders & Alerts

CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2),
  due_date DATE NOT NULL,
  frequency VARCHAR(20) CHECK (frequency IN ('one-time', 'monthly', 'yearly')),
  is_paid BOOLEAN DEFAULT false,
  linked_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  category VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_due_date ON reminders(due_date);
CREATE INDEX idx_reminders_is_paid ON reminders(is_paid);

-- Row Level Security
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders"
  ON reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
  ON reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Sample data for testing
-- INSERT INTO reminders (user_id, title, amount, due_date, frequency, category)
-- VALUES
--   ('USER_ID', 'Electric Bill', -125.00, '2025-11-10', 'monthly', 'Utilities'),
--   ('USER_ID', 'Car Insurance', -650.00, '2025-11-20', 'monthly', 'Insurance'),
--   ('USER_ID', 'Credit Card Payment', -500.00, '2025-11-25', 'monthly', 'Credit Card');
