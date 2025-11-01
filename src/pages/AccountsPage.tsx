const AccountsPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
        <button className="btn-primary">Add Account</button>
      </div>

      <div className="card">
        <p className="text-gray-500 text-center py-12">
          No accounts yet. Create your first account to start tracking your finances.
        </p>
      </div>
    </div>
  );
};

export default AccountsPage;
