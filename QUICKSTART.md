# Money Manager - Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies (1 minute)

```bash
cd /Users/scottymker/code/microsoft-money
npm install papaparse date-fns
npm install --save-dev @types/papaparse
```

### Step 2: Run Database Migrations (2 minutes)

1. Open Supabase Dashboard → SQL Editor
2. Copy/paste each migration file in order:

```sql
-- Run these one by one in Supabase SQL Editor

-- 1. Recurring Transactions
-- Copy contents of migrations/001_recurring_transactions.sql

-- 2. Reminders
-- Copy contents of migrations/002_reminders.sql

-- 3. Net Worth Snapshots
-- Copy contents of migrations/003_net_worth_snapshots.sql

-- 4. Savings Goals
-- Copy contents of migrations/004_savings_goals.sql

-- 5. Saved Filters
-- Copy contents of migrations/005_saved_filters.sql

-- 6. Investment Holdings
-- Copy contents of migrations/006_investment_holdings.sql

-- 7. Reconciliation History
-- Copy contents of migrations/007_reconciliation_history.sql

-- 8. Update Transactions Table
-- Copy contents of migrations/008_update_transactions.sql
```

### Step 3: Verify Installation (1 minute)

```bash
# Compile TypeScript (should have no errors)
npm run build

# Start dev server
npm run dev
```

### Step 4: Test Working Features (1 minute)

1. Navigate to `http://localhost:5173/microsoft-money/recurring`
2. Click "Add Recurring"
3. Create a test recurring transaction
4. Click "Process Now"
5. Navigate to transactions - verify transaction created

## What Works Right Now

### Fully Functional Features
1. **Recurring Transactions** - Complete CRUD page at `/recurring`
2. **Transfers** - TransferForm component ready (needs integration)
3. **Export CSV** - ExportButton component ready (needs integration)

### Ready to Use Components
- `ExportButton` - Drop into any page
- `TransferForm` - Add to TransactionsPage
- `ColorPicker` - Use in forms
- `ProgressBar` - Use for goals/budgets

### Complete Backend Services
All 8 service files ready with full CRUD operations:
- `recurring.service.ts`
- `transfers.service.ts`
- `reminders.service.ts`
- `goals.service.ts`
- `networth.service.ts`
- `investments.service.ts`
- `reconciliation.service.ts`
- `filters.service.ts`

## Next 30 Minutes - Get 3 More Features Working

### Add Transfer Button (5 minutes)

**File:** `src/pages/TransactionsPage.tsx`

```typescript
// Add import at top
import TransferForm from '../components/transfers/TransferForm';
import { ArrowRightLeft } from 'lucide-react';

// Add state
const [showTransferModal, setShowTransferModal] = useState(false);

// Add button in header (next to "Add Transaction")
<Button onClick={() => setShowTransferModal(true)} variant="outline">
  <ArrowRightLeft className="h-4 w-4 mr-2" />
  Transfer
</Button>

// Add modal at bottom of return
<TransferForm
  isOpen={showTransferModal}
  onClose={() => setShowTransferModal(false)}
  accounts={accounts}
  onSuccess={loadTransactions}
/>
```

### Add Export Button (5 minutes)

**File:** `src/pages/TransactionsPage.tsx`

```typescript
// Add import
import ExportButton from '../components/export/ExportButton';

// Add button in header
<ExportButton
  data={transactions}
  filename="transactions"
  columns={['date', 'payee', 'category', 'amount', 'memo']}
/>
```

### Add Reminders Page (20 minutes)

**File:** `src/pages/RemindersPage.tsx`

Copy `RecurringPage.tsx` and replace:
- `RecurringTransaction` → `Reminder`
- `getRecurringTransactions` → `getReminders`
- `createRecurringTransaction` → `createReminder`
- Update form fields for reminder data
- Add "Mark as Paid" button

**File:** `src/App.tsx`

```typescript
// Add import
import RemindersPage from './pages/RemindersPage';

// Add route
<Route path="/reminders" element={
  user ? <MainLayout user={user}><RemindersPage /></MainLayout> : <Navigate to="/login" />
} />
```

**File:** `src/components/layout/MainLayout.tsx`

```typescript
// Add to navigation array
{ name: 'Reminders', path: '/reminders', icon: Bell }
```

## File Checklist

### Created (Ready to Use)
- [x] 8 database migration files
- [x] 8 service files
- [x] Updated types file
- [x] RecurringPage.tsx (full example)
- [x] ExportButton.tsx
- [x] TransferForm.tsx
- [x] ColorPicker.tsx
- [x] ProgressBar.tsx
- [x] IMPLEMENTATION_GUIDE.md
- [x] COMPLETE_IMPLEMENTATION.md
- [x] TESTING_GUIDE.md
- [x] FEATURE_SUMMARY.md
- [x] QUICKSTART.md

### To Create (Using Examples)
- [ ] RemindersPage.tsx (copy RecurringPage.tsx)
- [ ] GoalsPage.tsx (copy RecurringPage.tsx + ProgressBar)
- [ ] NetWorthPage.tsx (copy RecurringPage.tsx + recharts)
- [ ] CategoriesPage.tsx (copy RecurringPage.tsx + ColorPicker)
- [ ] InvestmentsPage.tsx (copy RecurringPage.tsx)

### To Update (Add Features)
- [ ] TransactionsPage.tsx (add Transfer + Export buttons)
- [ ] DashboardPage.tsx (add widgets)
- [ ] AccountsPage.tsx (add Reconcile button)
- [ ] ReportsPage.tsx (add Export button)
- [ ] App.tsx (add 6 routes)
- [ ] MainLayout.tsx (add 6 nav items)

## Quick Integration Examples

### Add to Dashboard

```typescript
// In DashboardPage.tsx
import { getUpcomingReminders } from '../services/reminders.service';
import { getSavingsGoals } from '../services/goals.service';

// In component
const [reminders, setReminders] = useState([]);
const [goals, setGoals] = useState([]);

useEffect(() => {
  async function loadWidgets() {
    const [remindersData, goalsData] = await Promise.all([
      getUpcomingReminders(30),
      getSavingsGoals()
    ]);
    setReminders(remindersData);
    setGoals(goalsData.slice(0, 3)); // Top 3 goals
  }
  loadWidgets();
}, []);

// In return
<Card>
  <h2>Upcoming Bills ({reminders.length})</h2>
  {reminders.map(reminder => (
    <div key={reminder.id}>
      {reminder.title} - ${reminder.amount} - {reminder.due_date}
    </div>
  ))}
</Card>

<Card>
  <h2>Savings Goals</h2>
  {goals.map(goal => (
    <ProgressBar
      key={goal.id}
      current={goal.current_amount}
      target={goal.target_amount}
      color={goal.color}
      label={goal.name}
    />
  ))}
</Card>
```

### Add Navigation Items

```typescript
// In MainLayout.tsx navigation array
const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Accounts', path: '/accounts', icon: Wallet },
  { name: 'Transactions', path: '/transactions', icon: Receipt },
  { name: 'Recurring', path: '/recurring', icon: Repeat },        // NEW
  { name: 'Reminders', path: '/reminders', icon: Bell },          // NEW
  { name: 'Categories', path: '/categories', icon: Tag },         // NEW
  { name: 'Budgets', path: '/budgets', icon: PieChart },
  { name: 'Goals', path: '/goals', icon: Target },                // NEW
  { name: 'Net Worth', path: '/networth', icon: TrendingUp },    // NEW
  { name: 'Investments', path: '/investments', icon: LineChart }, // NEW
  { name: 'Reports', path: '/reports', icon: BarChart2 },
  { name: 'Import', path: '/import', icon: Upload },
];
```

## Troubleshooting

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### TypeScript Errors

```bash
# Check for errors
npm run type-check

# Common fixes:
# 1. Restart VS Code TypeScript server
# 2. Check all imports are correct
# 3. Verify service return types match component expectations
```

### Database Errors

1. Check Supabase Dashboard → Database → Tables
2. Verify all 8 new tables exist
3. Check RLS policies are enabled
4. Test with Supabase SQL Editor

### Import Errors

```typescript
// If papaparse not found:
npm install papaparse @types/papaparse

// If date-fns not found:
npm install date-fns

// Verify in package.json dependencies section
```

## Time Estimates

### If You Follow This Guide

| Task | Time | Result |
|------|------|--------|
| Setup & Migrations | 5 min | Database ready |
| Add Transfer | 5 min | Feature working |
| Add Export | 5 min | Feature working |
| Add Reminders | 20 min | Full page working |
| Add Goals | 20 min | Full page working |
| Add Categories | 20 min | Full page working |
| **Total** | **75 min** | **6 features working** |

### Remaining Work After Quick Start

- NetWorth page (30 min - needs chart)
- Investments page (30 min)
- Split transactions (20 min)
- Reconciliation modal (30 min)
- Advanced filters (20 min)
- Mobile optimization (30 min)

**Total remaining:** ~2.5 hours to complete all 12 features

## Success Indicators

You'll know it's working when:
1. ✅ No TypeScript errors
2. ✅ npm run dev starts without issues
3. ✅ Can navigate to /recurring
4. ✅ Can create and auto-generate recurring transactions
5. ✅ Can create transfers
6. ✅ Can export to CSV

## Getting Help

### Check These First
1. Browser console (F12) for JavaScript errors
2. Network tab for failed API calls
3. Supabase logs for database errors
4. TypeScript errors in VS Code

### Common Solutions
- **"Cannot find module"** → npm install <module>
- **"Not authenticated"** → Check Supabase auth
- **"Permission denied"** → Check RLS policies
- **UI not updating** → Check state management

## Next Steps

After quick start:
1. Complete remaining pages using RecurringPage.tsx as template
2. Add widgets to Dashboard
3. Test all features per TESTING_GUIDE.md
4. Deploy to production

---

**You have everything you need to get started!**

All the hard work is done:
- ✅ Database schema designed
- ✅ Business logic implemented
- ✅ Types defined
- ✅ Working examples provided
- ✅ Documentation complete

Now it's just assembly and testing. Good luck!
