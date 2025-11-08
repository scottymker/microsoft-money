-- Migration: Convert budgets.category_id from UUID to category name (TEXT)
-- This aligns budgets with how transactions store categories
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Add a new column for category name
ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS category_name TEXT;

-- Step 2: Populate the new column with category names from the categories table
UPDATE budgets
SET category_name = categories.name
FROM categories
WHERE budgets.category_id = categories.id;

-- Step 3: Drop the old category_id column (this will also drop the foreign key constraint)
ALTER TABLE budgets
DROP COLUMN IF EXISTS category_id;

-- Step 4: Rename category_name to category_id
ALTER TABLE budgets
RENAME COLUMN category_name TO category_id;

-- Step 5: Add NOT NULL constraint
ALTER TABLE budgets
ALTER COLUMN category_id SET NOT NULL;

-- Step 6: Add comment
COMMENT ON COLUMN budgets.category_id IS 'Category name (not UUID) - matches category names in categories table';
