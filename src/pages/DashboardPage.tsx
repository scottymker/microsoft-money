const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Quick stats cards */}
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Total Balance</p>
          <p className="text-2xl font-bold text-gray-900">$0.00</p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-600 mb-1">This Month Income</p>
          <p className="text-2xl font-bold text-green-600">$0.00</p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-600 mb-1">This Month Expenses</p>
          <p className="text-2xl font-bold text-red-600">$0.00</p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Net Worth</p>
          <p className="text-2xl font-bold text-gray-900">$0.00</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent transactions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Transactions
          </h2>
          <p className="text-gray-500 text-center py-8">
            No transactions yet. Import a CSV file or add transactions manually.
          </p>
        </div>

        {/* Account balances */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Account Balances
          </h2>
          <p className="text-gray-500 text-center py-8">
            No accounts yet. Create your first account to get started.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
