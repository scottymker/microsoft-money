import { useState, useEffect } from 'react';
import type { Category } from '../types';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../services/categories.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/ToastContainer';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import CategoryForm from '../components/categories/CategoryForm';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCategory(undefined);
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete.id);
      showToast('Category deleted', 'success');
      setShowDeleteConfirm(false);
      setCategoryToDelete(undefined);
      fetchCategories();
    } catch (error: any) {
      // Check if error is due to foreign key constraint (category has transactions)
      const errorMessage = error.message || 'Failed to delete category';
      if (errorMessage.includes('foreign key') || errorMessage.includes('violates') || errorMessage.includes('constraint')) {
        showToast('Cannot delete category because it has associated transactions', 'error');
      } else {
        showToast(errorMessage, 'error');
      }
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, data);
        showToast('Category updated', 'success');
      } else {
        await createCategory(data);
        showToast('Category created', 'success');
      }
      setShowModal(false);
      setSelectedCategory(undefined);
      fetchCategories();
    } catch (error: any) {
      showToast(error.message || 'Failed to save category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Separate categories by type
  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  if (loading) return <LoadingSpinner />;

  const CategoryTable = ({ categories, type }: { categories: Category[], type: 'income' | 'expense' }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Color
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                No {type} categories yet.
              </td>
            </tr>
          ) : (
            categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {category.icon && (
                      <span className="text-xl">{category.icon}</span>
                    )}
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                    category.type === 'income'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.type === 'income' ? 'Income' : 'Expense'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-xs text-gray-500 font-mono">{category.color}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage income and expense categories</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card className="p-8 text-center">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No categories yet.</p>
          <Button onClick={handleCreate} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Category
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Income Categories */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 bg-green-50 border-b border-green-100">
              <h2 className="text-lg font-semibold text-green-900 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Income Categories
                <span className="text-sm font-normal text-green-700">({incomeCategories.length})</span>
              </h2>
            </div>
            <CategoryTable categories={incomeCategories} type="income" />
          </Card>

          {/* Expense Categories */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 bg-red-50 border-b border-red-100">
              <h2 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Expense Categories
                <span className="text-sm font-normal text-red-700">({expenseCategories.length})</span>
              </h2>
            </div>
            <CategoryTable categories={expenseCategories} type="expense" />
          </Card>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCategory(undefined);
        }}
        title={selectedCategory ? 'Edit Category' : 'New Category'}
      >
        <CategoryForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setSelectedCategory(undefined);
          }}
          initialData={selectedCategory}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCategoryToDelete(undefined);
        }}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone. Note: You cannot delete categories that have associated transactions.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
