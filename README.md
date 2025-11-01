# Money Manager - Personal Finance App

A modern web-based personal finance management system inspired by Microsoft Money. Built with React, TypeScript, Supabase, and Tailwind CSS.

## Features

- 📊 **Dashboard** - Overview of your financial health at a glance
- 💳 **Account Management** - Track checking, savings, credit cards, and investments
- 📝 **Transaction Tracking** - Manually add or import transactions
- 📥 **CSV Import** - Import bank statements with intelligent column mapping
- 📦 **Duplicate Detection** - Automatically detect duplicate transactions
- 🏷️ **Smart Categorization** - Auto-assign categories based on previous transactions
- 💰 **Budgeting** - Set and track monthly/annual budgets by category
- 📈 **Reports & Visualizations** - Spending trends, category breakdowns, and net worth tracking
- 🔐 **Secure Authentication** - Email/password auth with Supabase
- 🌐 **Cloud Sync** - All data synced to Supabase PostgreSQL

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Routing**: React Router v6
- **Charts**: Recharts
- **CSV Parsing**: PapaParse
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/scottymker/microsoft-money.git
cd microsoft-money
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Set up Supabase:
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Get your project URL and anon key from Settings > API
   - Update your `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## Supabase Database Setup

See `docs/database-schema.sql` for the complete database setup script.

Run the SQL in your Supabase SQL editor to create the required tables with Row Level Security.

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── accounts/      # Account management components
│   ├── transactions/  # Transaction components
│   ├── budgets/       # Budget components
│   ├── reports/       # Report/chart components
│   ├── import/        # CSV import components
│   ├── common/        # Reusable components
│   └── layout/        # Layout components
├── services/
│   ├── supabase.ts          # Supabase client
│   ├── accounts.service.ts  # Account CRUD operations
│   ├── transactions.service.ts  # Transaction operations
│   └── csv.service.ts       # CSV parsing and import
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── pages/             # Page components
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

## Deployment

The app auto-deploys to GitHub Pages via GitHub Actions on every push to `main`.

### Manual Deployment

```bash
npm run build
# Upload the dist/ folder to your hosting provider
```

## Features Roadmap

- [x] Basic project structure
- [x] Authentication
- [ ] Account management
- [ ] Transaction tracking
- [ ] CSV import functionality
- [ ] Budget creation and tracking
- [ ] Reports and visualizations
- [ ] Data export (CSV, PDF)
- [ ] Recurring transactions
- [ ] Split transactions
- [ ] Multi-currency support
- [ ] Mobile responsive design
- [ ] Dark mode
- [ ] Advanced filtering and search

## License

MIT

## Acknowledgments

Inspired by the classic Microsoft Money software (1991-2009)
