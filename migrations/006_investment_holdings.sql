-- Migration: Add investment_holdings table
-- Feature 12: Investment Account Support

CREATE TABLE IF NOT EXISTS investment_holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  shares DECIMAL(12, 6) NOT NULL DEFAULT 0,
  cost_basis DECIMAL(12, 2) NOT NULL DEFAULT 0,
  current_price DECIMAL(12, 2),
  last_updated TIMESTAMP WITH TIME ZONE,
  asset_type VARCHAR(50) CHECK (asset_type IN ('stock', 'etf', 'mutual_fund', 'bond', 'crypto', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, symbol)
);

-- Create indexes
CREATE INDEX idx_investment_holdings_user_id ON investment_holdings(user_id);
CREATE INDEX idx_investment_holdings_account_id ON investment_holdings(account_id);
CREATE INDEX idx_investment_holdings_symbol ON investment_holdings(symbol);

-- Row Level Security
ALTER TABLE investment_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own investment holdings"
  ON investment_holdings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investment holdings"
  ON investment_holdings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investment holdings"
  ON investment_holdings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investment holdings"
  ON investment_holdings FOR DELETE
  USING (auth.uid() = user_id);

-- Sample data for testing
-- INSERT INTO investment_holdings (user_id, account_id, symbol, name, shares, cost_basis, current_price, asset_type)
-- VALUES
--   ('USER_ID', 'INVESTMENT_ACCOUNT_ID', 'AAPL', 'Apple Inc.', 50.000000, 7500.00, 175.50, 'stock'),
--   ('USER_ID', 'INVESTMENT_ACCOUNT_ID', 'VTSAX', 'Vanguard Total Stock Market Index', 100.000000, 12000.00, 128.75, 'mutual_fund'),
--   ('USER_ID', 'INVESTMENT_ACCOUNT_ID', 'BTC', 'Bitcoin', 0.250000, 10000.00, 45000.00, 'crypto');
