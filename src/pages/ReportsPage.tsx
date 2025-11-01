const ReportsPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Spending by Category
          </h2>
          <p className="text-gray-500 text-center py-8">
            No data yet. Add transactions to see spending reports.
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Income vs Expenses
          </h2>
          <p className="text-gray-500 text-center py-8">
            No data yet. Add transactions to see income vs expense trends.
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Spending Trends
          </h2>
          <p className="text-gray-500 text-center py-8">
            No data yet. Add transactions to see spending trends over time.
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Net Worth Over Time
          </h2>
          <p className="text-gray-500 text-center py-8">
            No data yet. Add accounts and transactions to track net worth.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
