const TransactionsPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <button className="btn-primary">Add Transaction</button>
      </div>

      <div className="card">
        <p className="text-gray-500 text-center py-12">
          No transactions yet. Import a CSV file or add transactions manually.
        </p>
      </div>
    </div>
  );
};

export default TransactionsPage;
