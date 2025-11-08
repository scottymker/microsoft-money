import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ensureDefaultCategories } from '../services/categories.service';
import {
  getBudgetsWithSpending,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../services/budgets.service';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/ToastContainer';
import BudgetForm from '../components/budgets/BudgetForm';
import BudgetCard from '../components/budgets/BudgetCard';

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<any | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsData, categoriesData] = await Promise.all([
        getBudgetsWithSpending(),
        ensureDefaultCategories(),
      ]);
      setBudgets(budgetsData);
      setCategories(categoriesData.filter((c) => c.type === 'expense'));
    } catch (error) {
      showToast('Failed to load budgets', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedBudget(undefined);
    setShowModal(true);
  };

  const handleEdit = (budget: any) => {
    setSelectedBudget(budget);
    setShowModal(true);
  };

  const handleDelete = (budget: any) => {
    setBudgetToDelete(budget);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!budgetToDelete) return;
    try {
      setSubmitting(true);
      await deleteBudget(budgetToDelete.id);
      showToast('Budget deleted successfully', 'success');
      setShowDeleteConfirm(false);
      setBudgetToDelete(undefined);
      fetchData();
    } catch (error) {
      showToast('Failed to delete budget', 'error');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (selectedBudget) {
        await updateBudget(selectedBudget.id, data);
        showToast('Budget updated successfully', 'success');
      } else {
        await createBudget(data);
        showToast('Budget created successfully', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      showToast('Failed to save budget', 'error');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Map categories to select options using category name as value
  const categoryOptions = categories.map((c) => ({
    value: c.name,
    label: `${c.icon || ''} ${c.name}`.trim(),
  }));

  if (loading) {
    return <LoadingSpinner text="Loading budgets..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-5 h-5 mr-2" />
          Create Budget
        </Button>
      </div>

      {budgets.length === 0 ? (
        <div className="card">
          <p className="text-gray-500 text-center py-12">
            No budgets yet. Create your first budget to track your spending goals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            // Find the category to get the icon
            const category = categories.find(c => c.name === budget.category_id);
            const categoryDisplay = category ? `${category.icon || ''} ${category.name}`.trim() : budget.category_id;

            return (
              <BudgetCard
                key={budget.id}
                budget={budget}
                categoryName={categoryDisplay}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedBudget ? 'Edit Budget' : 'Create Budget'}
      >
        <BudgetForm
          budget={selectedBudget}
          categories={categoryOptions}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          loading={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Budget"
        message={`Are you sure you want to delete this budget?`}
        confirmText="Delete"
        variant="danger"
        loading={submitting}
      />
    </div>
  );
};

export default BudgetsPage;
