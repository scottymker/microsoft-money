# Money Manager - Testing Guide

## Setup and Installation

### Prerequisites
- Node.js and npm installed
- Supabase account with database set up
- Authentication configured

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

## Feature Testing Checklist

### 1. Account Management (/accounts)

**Test Creating an Account:**
1. Click "Add Account" button
2. Fill in account details:
   - Name: "Chase Checking"
   - Type: Checking Account
   - Opening Balance: 5000
   - Institution: Chase Bank
   - Account Number: 1234
3. Click "Create Account"
4. Verify toast notification appears
5. Verify account appears in grid
6. Verify summary cards update with correct totals

**Test Editing an Account:**
1. Click "Edit" button on an account
2. Change the name
3. Click "Update Account"
4. Verify changes are reflected
5. Verify toast notification appears

**Test Deleting an Account:**
1. Click "Delete" button on an account
2. Confirm deletion in dialog
3. Verify account is removed
4. Verify summary totals update
5. Verify toast notification appears

**Test Account Summary:**
- Create multiple account types (checking, credit, savings)
- Verify assets total is correct (checking + savings)
- Verify liabilities total is correct (credit card balances)
- Verify net worth = assets - liabilities

---

### 2. CSV Import (/import)

**Prepare Test CSV File:**
Create a file named `test_transactions.csv`:
```csv
Date,Amount,Description,Memo
2024-01-15,-45.50,Starbucks,Morning coffee
2024-01-16,-120.00,Whole Foods,Groceries
2024-01-17,2500.00,Employer Inc,Salary deposit
2024-01-18,-35.99,Netflix,Monthly subscription
2024-01-20,-85.00,Shell Gas Station,Fuel
```

**Test CSV Upload:**
1. Navigate to /import
2. Click "Choose File" and select test CSV
3. Verify file uploads successfully
4. Verify column mapping auto-detects Date, Amount, Description
5. Adjust mapping if needed
6. Click "Continue to Preview"

**Test Import Preview:**
1. Verify all 5 transactions appear
2. Verify amounts are formatted correctly
3. Verify dates are parsed correctly
4. Select target account from dropdown
5. Uncheck one transaction to test selection
6. Click "Import X Transactions"

**Test Duplicate Detection:**
1. Import the same CSV file again
2. Verify duplicate transactions are highlighted in yellow
3. Verify "Duplicate" label appears
4. Deselect duplicates
5. Import only non-duplicates

**Test Auto-Category Assignment:**
1. Import transactions and manually categorize them
2. Import a new CSV with similar payees
3. Verify categories are automatically assigned based on previous matches

---

### 3. Transaction Management (/transactions)

**Test Creating a Transaction:**
1. Click "Add Transaction"
2. Fill in transaction details:
   - Account: Select an account
   - Date: Today's date
   - Amount: -50.00 (negative for expense)
   - Payee: "Target"
   - Category: "Shopping"
   - Memo: "Household items"
3. Check "Mark as reconciled" checkbox
4. Click "Add Transaction"
5. Verify transaction appears in list
6. Verify stats cards update

**Test Editing a Transaction:**
1. Click edit icon on a transaction
2. Change amount and category
3. Click "Update Transaction"
4. Verify changes appear
5. Verify account balance updates

**Test Deleting a Transaction:**
1. Click delete icon on a transaction
2. Confirm deletion
3. Verify transaction is removed
4. Verify account balance adjusts

**Test Reconciliation Toggle:**
1. Click the circle icon on an unreconciled transaction
2. Verify it changes to a green checkmark
3. Click again to toggle back
4. Verify toast notifications appear

**Test Filters:**
1. Filter by Account - select one account
   - Verify only transactions from that account show
2. Search by payee - type "Star"
   - Verify only matching transactions show
3. Filter by date range
   - Set start and end dates
   - Verify only transactions in range show
4. Click "Reset" to clear filters
   - Verify all transactions return

**Test Stats Cards:**
1. Add income transaction (+1000)
2. Add expense transaction (-200)
3. Verify "Total Income" shows correct positive sum
4. Verify "Total Expenses" shows correct positive sum
5. Verify "Net" shows income minus expenses

---

### 4. Budget Creation & Tracking (/budgets)

**Test Creating a Budget:**
1. Click "Create Budget"
2. Select category: "Groceries"
3. Enter amount: 500
4. Select period: Monthly
5. Set start date to beginning of current month
6. Check "Rollover" checkbox
7. Click "Create Budget"
8. Verify budget card appears

**Test Budget Progress Indicators:**
1. Create budget for "Dining" with $300 limit
2. Add transaction with category "Dining" for -$150
3. Go back to budgets page
4. Verify budget shows:
   - Spent: $150
   - Progress bar at 50%
   - Status: Green (good)
5. Add transaction for -$100 (total $250)
6. Verify progress bar at 83%
7. Verify status: Yellow (warning)
8. Add transaction for -$60 (total $310)
9. Verify progress bar at 100%
10. Verify status: Red (over budget)
11. Verify "Over budget by $10" message appears

**Test Editing a Budget:**
1. Click edit icon on a budget
2. Change amount to 600
3. Click "Update Budget"
4. Verify budget card updates

**Test Deleting a Budget:**
1. Click delete icon on a budget
2. Confirm deletion
3. Verify budget is removed

**Test Multiple Budgets:**
1. Create budgets for 5 different categories
2. Verify all appear in grid
3. Verify each calculates spending independently

---

### 5. Reports & Visualizations (/reports)

**Test Spending by Category Chart:**
1. Add transactions across multiple categories
2. Navigate to Reports page
3. Verify pie chart displays
4. Verify categories are labeled with percentages
5. Verify legend shows category names and amounts
6. Verify total matches sum of all expenses

**Test Income vs Expenses Chart:**
1. Add transactions over multiple months
2. Navigate to Reports page
3. Verify bar chart displays
4. Verify months are labeled on X-axis
5. Verify green bars show income
6. Verify red bars show expenses
7. Hover over bars to see tooltip values

**Test Date Range Filter:**
1. Set start date to 1 month ago
2. Set end date to today
3. Verify charts update to show only transactions in range
4. Change date range
5. Verify charts update again

**Test CSV Export:**
1. Click "Export CSV" button
2. Verify file downloads
3. Open CSV file
4. Verify all transactions in date range are included
5. Verify columns: Date, Account, Payee, Category, Memo, Amount, Reconciled

**Test Empty State:**
1. Set date range to future dates (no transactions)
2. Verify "No data available" message shows
3. Reset to current month
4. Verify charts reappear

---

### 6. Dashboard (/dashboard)

**Test Dashboard Stats:**
1. Create accounts with various balances
2. Add income and expense transactions
3. Navigate to Dashboard
4. Verify "Total Balance" shows sum of all account balances
5. Verify "This Month Income" shows current month income only
6. Verify "This Month Expenses" shows current month expenses only
7. Verify "Net Worth" matches accounts page net worth

**Test Recent Transactions:**
1. Add 10+ transactions
2. Navigate to Dashboard
3. Verify only 5 most recent transactions show
4. Verify transactions display:
   - Payee name
   - Date and category
   - Amount (colored green for income, red for expenses)
5. Click "View All" button
6. Verify navigates to Transactions page

**Test Account Balances:**
1. Create 3+ accounts
2. Navigate to Dashboard
3. Verify all accounts are listed
4. Verify balances are correct
5. Click "View All" button
6. Verify navigates to Accounts page

**Test Quick Actions:**
1. Click "Import CSV" button
2. Verify navigates to Import page
3. Return to Dashboard
4. Click "Add Transaction" button
5. Verify navigates to Transactions page

---

## Integration Testing Scenarios

### Scenario 1: New User Onboarding
1. Login as new user
2. Create first checking account with $5000
3. Create first savings account with $10000
4. Import bank statement CSV
5. Review imported transactions
6. Create budget for top spending category
7. View reports to see spending breakdown

### Scenario 2: Monthly Reconciliation
1. Go to Transactions page
2. Filter by current month
3. Compare with bank statement
4. Mark all matching transactions as reconciled
5. Identify any discrepancies
6. Add missing transactions manually
7. View Dashboard to confirm balance matches bank

### Scenario 3: Budget Tracking
1. Create monthly budget for each major category
2. Throughout month, add transactions
3. Check Budgets page daily
4. Adjust spending based on budget progress
5. End of month: review Reports page
6. Identify categories over budget
7. Adjust next month's budgets accordingly

---

## Error Handling Tests

### Test Network Errors:
1. Disconnect from internet
2. Try to create an account
3. Verify error toast appears: "Failed to save account"
4. Reconnect to internet
5. Try again - should succeed

### Test Validation Errors:
1. Try to create account with empty name
2. Verify error message: "Account name is required"
3. Try to create transaction with invalid amount (text)
4. Verify error message: "Valid amount is required"

### Test Authentication:
1. Logout from application
2. Try to navigate to /accounts directly
3. Verify redirects to /login
4. Login again
5. Verify redirects to dashboard

---

## Performance Tests

### Test Large Dataset:
1. Import CSV with 1000+ transactions
2. Verify import completes within 10 seconds
3. Navigate to Transactions page
4. Verify page loads within 2 seconds
5. Apply filters
6. Verify filtering is instant (< 500ms)

### Test Concurrent Operations:
1. Open multiple browser tabs
2. Create account in Tab 1
3. Create transaction in Tab 2
4. Verify both operations succeed
5. Verify data is consistent across tabs (may need refresh)

---

## Browser Compatibility

Test in the following browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Verify:
- All features work correctly
- Layouts are responsive
- Charts render properly
- Modals display correctly

---

## Mobile Responsiveness

Test on mobile devices or browser dev tools:
1. Set viewport to iPhone (375px width)
2. Verify navigation menu is accessible
3. Verify forms are usable
4. Verify tables are scrollable
5. Verify charts are readable
6. Verify buttons are tappable (not too small)

---

## Known Limitations

1. **Real-time sync**: Changes in one tab don't automatically appear in other tabs (refresh required)
2. **Large imports**: Importing 10,000+ transactions may take longer
3. **Date parsing**: CSV date formats may need adjustment for non-US formats
4. **Categories**: Currently string-based, not relational (budget category must match transaction category exactly)

---

## Bug Reporting

If you find any bugs:
1. Note the exact steps to reproduce
2. Include browser and OS version
3. Check browser console for errors
4. Note any error toast messages
5. Document expected vs actual behavior

---

## Success Criteria

All features pass testing when:
- All CRUD operations work without errors
- Data persists correctly in database
- UI updates reflect database changes
- Error handling provides helpful messages
- Loading states show during operations
- Toast notifications appear for all actions
- Responsive design works on mobile and desktop
- Charts display data accurately
- CSV import handles various formats
- Budget tracking calculates correctly
