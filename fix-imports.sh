#!/bin/bash
# Fix type-only imports in all TypeScript files

find src/components src/pages -name "*.tsx" -type f | while read file; do
  # Fix common type imports
  sed -i '' 's/import { \(Account\) }/import type { \1 }/g' "$file"
  sed -i '' 's/import { \(AccountType\) }/import type { \1 }/g' "$file"
  sed -i '' 's/import { \(Transaction\) }/import type { \1 }/g' "$file"
  sed -i '' 's/import { \(FilterOptions\) }/import type { \1 }/g' "$file"
  sed -i '' 's/import { \(Budget\) }/import type { \1 }/g' "$file"
  sed -i '' 's/import { \(BudgetPeriod\) }/import type { \1 }/g' "$file"
  sed -i '' 's/import { \(CSVColumnMapping\) }/import type { \1 }/g' "$file"
  sed -i '' 's/import { \(CSVImportRow\) }/import type { \1 }/g' "$file"
  sed -i '' 's/import { \(ReactNode\) }/import type { \1 }/g' "$file"
  sed -i '' 's/import { \(InputHTMLAttributes\) }/import type { \1 }/g' "$file"
  sed -i '' 's/import { \(SelectHTMLAttributes\) }/import type { \1 }/g' "$file"
done
