const BudgetsPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
        <button className="btn-primary">Create Budget</button>
      </div>

      <div className="card">
        <p className="text-gray-500 text-center py-12">
          No budgets yet. Create your first budget to track your spending goals.
        </p>
      </div>
    </div>
  );
};

export default BudgetsPage;
