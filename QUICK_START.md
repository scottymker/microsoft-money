# Money Manager - Quick Start Guide

## Installation and First Run

### 1. Install Dependencies
```bash
cd /Users/scottymker/code/microsoft-money
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app should open at `http://localhost:5173/microsoft-money`

### 3. Login
- If you have an account, login
- If not, create a new account

---

## First-Time Setup (5 Minutes)

### Step 1: Create Your First Account
1. Navigate to **Accounts** page (sidebar menu)
2. Click **"Add Account"** button
3. Fill in:
   - Name: "My Checking"
   - Type: "Checking Account"
   - Opening Balance: 5000
   - Institution: "Chase Bank" (optional)
4. Click **"Create Account"**
5. See your account appear in the grid

### Step 2: Add a Few Transactions
1. Navigate to **Transactions** page
2. Click **"Add Transaction"**
3. Fill in:
   - Account: Select "My Checking"
   - Date: Today's date
   - Amount: -50.00 (negative for expense)
   - Payee: "Starbucks"
   - Category: "Dining"
4. Click **"Add Transaction"**
5. Repeat for a few more transactions (mix of income and expenses)

### Step 3: Create a Budget
1. Navigate to **Budgets** page
2. Click **"Create Budget"**
3. Fill in:
   - Category: "Dining"
   - Amount: 300
   - Period: "Monthly"
   - Start Date: First day of current month
4. Click **"Create Budget"**
5. See budget card with progress bar

### Step 4: View Reports
1. Navigate to **Reports** page
2. See pie chart of spending by category
3. See bar chart of income vs expenses
4. Adjust date range to see different time periods

### Step 5: Check Dashboard
1. Navigate to **Dashboard**
2. See all your stats in one place
3. Recent transactions
4. Account balances

**Done! You're now using Money Manager.**

---

## Quick CSV Import Test

### Create a Test CSV File

Create a file named `test_transactions.csv`:
```csv
Date,Amount,Description,Memo
2024-01-15,-45.50,Starbucks,Morning coffee
2024-01-16,-120.00,Whole Foods,Groceries
2024-01-17,2500.00,Employer Inc,Salary deposit
2024-01-18,-35.99,Netflix,Monthly subscription
2024-01-20,-85.00,Shell Gas Station,Fuel
```

### Import the CSV
1. Navigate to **Import** page
2. Click **"Choose File"**
3. Select `test_transactions.csv`
4. Verify columns are auto-detected
5. Click **"Continue to Preview"**
6. Select your account
7. Click **"Import 5 Transactions"**
8. See success message
9. Navigate to **Transactions** to see imported data

---

## Common Tasks

### Add an Income Transaction
- Amount: **positive number** (e.g., 2500.00)
- Category: "Salary" or "Freelance"
- Shows in green

### Add an Expense Transaction
- Amount: **negative number** (e.g., -50.00)
- Category: "Groceries", "Dining", etc.
- Shows in red

### Mark Transaction as Reconciled
- Go to Transactions page
- Click the circle icon next to a transaction
- It turns into a green checkmark
- Helps track which transactions match your bank statement

### Filter Transactions
1. Use the filters at the top of Transactions page
2. Select an account to see only that account's transactions
3. Enter a search term to find specific payees
4. Set date range to see transactions in specific period
5. Click "Reset" to clear all filters

### Edit Account Balance
- Don't edit opening balance directly to adjust balance
- Instead, add a transaction for the adjustment
- For example, if balance is off by $10, add a transaction for $10 with category "Adjustment"

### Export Data
1. Go to Reports page
2. Set your date range
3. Click "Export CSV"
4. File downloads with all transactions in that range

---

## Keyboard Shortcuts

- **ESC** - Close any open modal
- **Tab** - Navigate between form fields
- **Enter** - Submit form (when in a form)

---

## Tips and Tricks

### Budget Management
- Create budgets at the start of each month
- Check budget progress weekly
- Adjust spending when you see yellow or red status
- Use "Rollover" option to carry unused budget to next month

### Transaction Organization
- Be consistent with category names
- Use categories like "Groceries", "Dining", "Transportation"
- Add memos for details (e.g., "Dinner with John" vs just "Restaurant")
- Mark transactions as reconciled after matching with bank

### CSV Import Best Practices
- Import bank statements monthly
- Check for duplicates before importing
- Review all transactions before final import
- Use the same account for all transactions in one CSV

### Reporting
- Set date range to "This Month" to see current spending
- Compare multiple months to spot trends
- Export to CSV for further analysis in Excel

---

## Troubleshooting

### Problem: "Failed to load accounts"
**Solution**: Check your internet connection and Supabase status

### Problem: Charts not showing data
**Solution**: Ensure you have transactions in the selected date range

### Problem: Import says all transactions are duplicates
**Solution**: This means you've already imported this file. Duplicates are based on date + amount + payee.

### Problem: Budget not showing spending
**Solution**: Ensure transaction category matches budget category exactly (case-sensitive)

### Problem: Account balance seems wrong
**Solution**:
1. Go to Transactions page
2. Filter by that account
3. Check all transactions
4. Look for any errors or missing transactions

### Problem: Toast notifications not appearing
**Solution**: This is a bug. The App.tsx should have ToastProvider wrapping the entire app (which has been added).

---

## Understanding the Interface

### Color Coding
- **Green** = Income, positive, good status
- **Red** = Expense, negative, over budget
- **Yellow** = Warning, approaching budget limit
- **Gray** = Neutral, unreconciled

### Icons
- **Plus (+)** = Add new item
- **Edit (pencil)** = Edit existing item
- **Delete (trash)** = Delete item
- **Circle** = Not reconciled
- **Checkmark** = Reconciled
- **Arrow Right** = Navigate or view more

### Account Types
- **Checking** = Bank checking account
- **Savings** = Bank savings account
- **Credit** = Credit card (balance shown as liability)
- **Investment** = Investment/brokerage account
- **Cash** = Physical cash

---

## Data Flow

1. **Create Accounts** → Accounts have balances
2. **Add Transactions** → Automatically updates account balances
3. **Set Budgets** → Tracks spending per category
4. **View Reports** → Visualizes spending patterns
5. **Monitor Dashboard** → See overview of everything

---

## Best Practices

### Daily
- Add transactions as they occur (while you remember)
- Takes 1-2 minutes per day

### Weekly
- Check budget progress
- Reconcile recent transactions
- Review Dashboard

### Monthly
- Import bank statement CSV
- Reconcile all transactions for the month
- Review Reports to see spending
- Adjust next month's budgets
- Check Net Worth trend

---

## Getting Help

1. **Check Documentation**
   - IMPLEMENTATION_SUMMARY.md - Development details
   - TESTING_GUIDE.md - Complete testing instructions
   - FEATURE_COMPLETION_SUMMARY.md - All features explained
   - FILES_CREATED.md - File structure and reference

2. **Browser Console**
   - Press F12 to open developer tools
   - Check Console tab for errors
   - Look for red error messages

3. **Common Fixes**
   - Refresh the page
   - Logout and login again
   - Clear browser cache
   - Check Supabase connection

---

## Sample Workflow

### Scenario: Monthly Financial Review

1. **Import Bank Statements** (5 min)
   - Export CSV from your bank
   - Import to Money Manager
   - Review for duplicates

2. **Reconcile Transactions** (10 min)
   - Filter by current month
   - Compare with bank statement
   - Mark all matching transactions as reconciled

3. **Review Spending** (5 min)
   - Go to Reports page
   - Look at Spending by Category
   - Identify top spending categories

4. **Check Budgets** (5 min)
   - Go to Budgets page
   - See which budgets are over
   - Decide on adjustments

5. **Plan Next Month** (5 min)
   - Adjust budgets based on this month
   - Set new goals
   - Create new budgets if needed

**Total Time: 30 minutes/month**

---

## Advanced Features

### Budget Rollover
- Enable "Rollover" when creating budget
- If you budget $500 but spend $400, the extra $100 rolls to next month
- Next month's budget becomes $600

### Transaction Filters
- Combine filters for precise searching
- Example: Account="Checking" + Search="Amazon" + Date Range="Last Month"
- Shows only Amazon purchases from checking account last month

### CSV Export
- Export filtered data for tax preparation
- Export by category (e.g., all "Medical" expenses)
- Import to Excel for pivot tables and advanced analysis

---

## Next Steps

Once you're comfortable:
1. Import all your bank statements for the last 3 months
2. Create budgets for all your spending categories
3. Set up a monthly routine for reconciliation
4. Track your net worth over time
5. Use reports to optimize spending

---

## Summary

Money Manager is your complete personal finance solution. With these features, you can:
- Track all your accounts in one place
- Import transactions automatically
- Stay within budget
- Analyze spending patterns
- Monitor your financial health

**Start simple, build the habit, and let the app grow with your needs.**

Happy tracking!
