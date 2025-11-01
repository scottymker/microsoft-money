-- Migration: Add net_worth_snapshots table
-- Feature 8: Net Worth Over Time

CREATE TABLE IF NOT EXISTS net_worth_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_assets DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_liabilities DECIMAL(12, 2) NOT NULL DEFAULT 0,
  net_worth DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

-- Create indexes
CREATE INDEX idx_net_worth_snapshots_user_id ON net_worth_snapshots(user_id);
CREATE INDEX idx_net_worth_snapshots_date ON net_worth_snapshots(snapshot_date);

-- Row Level Security
ALTER TABLE net_worth_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own net worth snapshots"
  ON net_worth_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own net worth snapshots"
  ON net_worth_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own net worth snapshots"
  ON net_worth_snapshots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own net worth snapshots"
  ON net_worth_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- Sample data for testing (historical snapshots)
-- INSERT INTO net_worth_snapshots (user_id, snapshot_date, total_assets, total_liabilities, net_worth)
-- VALUES
--   ('USER_ID', '2025-01-01', 50000.00, 25000.00, 25000.00),
--   ('USER_ID', '2025-02-01', 52000.00, 24500.00, 27500.00),
--   ('USER_ID', '2025-03-01', 54000.00, 24000.00, 30000.00);
