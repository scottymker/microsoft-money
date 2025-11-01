-- Run this query in Supabase SQL Editor to verify the investment_holdings table exists
-- and check its structure

-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name = 'investment_holdings'
) as table_exists;

-- If table exists, show its columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'investment_holdings'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'investment_holdings';

-- Count existing holdings (if any)
SELECT COUNT(*) as holding_count FROM investment_holdings;
