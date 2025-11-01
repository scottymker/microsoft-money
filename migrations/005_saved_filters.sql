-- Migration: Add saved_filters table
-- Feature 10: Advanced Search & Filters

CREATE TABLE IF NOT EXISTS saved_filters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  filter_config JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_saved_filters_user_id ON saved_filters(user_id);
CREATE INDEX idx_saved_filters_favorite ON saved_filters(is_favorite);

-- Row Level Security
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved filters"
  ON saved_filters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved filters"
  ON saved_filters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved filters"
  ON saved_filters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved filters"
  ON saved_filters FOR DELETE
  USING (auth.uid() = user_id);

-- Sample data for testing
-- INSERT INTO saved_filters (user_id, name, filter_config, is_favorite)
-- VALUES
--   ('USER_ID', 'Large Expenses', '{"minAmount": -1000, "transactionType": "expense"}', true),
--   ('USER_ID', 'This Month Groceries', '{"categoryIds": ["Groceries"], "dateRange": "thisMonth"}', false),
--   ('USER_ID', 'Unreconciled Transactions', '{"reconciled": false}', true);
