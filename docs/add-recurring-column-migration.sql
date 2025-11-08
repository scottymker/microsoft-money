-- Migration: Add recurring column to transactions table
-- Run this SQL in your Supabase SQL Editor to add the recurring field

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS recurring BOOLEAN DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN transactions.recurring IS 'Flag to mark if this is a recurring transaction';
