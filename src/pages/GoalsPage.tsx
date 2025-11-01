import { useState, useEffect } from 'react';
import type { SavingsGoal } from '../types';
import {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  calculateMonthlySavingsNeeded
} from '../services/goals.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ProgressBar from '../components/common/ProgressBar';
import { useToast } from '../components/common/ToastContainer';
import { Plus, Edit, Trash2, Target, Calendar, TrendingUp, Trophy } from 'lucide-react';
import GoalForm from '../components/goals/GoalForm';
import { differenceInDays } from 'date-fns';

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await getSavingsGoals();
      setGoals(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load savings goals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedGoal(undefined);
    setShowModal(true);
  };

  const handleEdit = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setShowModal(true);
  };

  const handleDelete = (goal: SavingsGoal) => {
    setGoalToDelete(goal);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!goalToDelete) return;

    try {
      await deleteSavingsGoal(goalToDelete.id);
      showToast('Goal deleted', 'success');
      setShowDeleteConfirm(false);
      setGoalToDelete(undefined);
      fetchGoals();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete goal', 'error');
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (selectedGoal) {
        await updateSavingsGoal(selectedGoal.id, data);
        showToast('Goal updated', 'success');
      } else {
        await createSavingsGoal(data);
        showToast('Goal created', 'success');
      }
      setShowModal(false);
      setSelectedGoal(undefined);
      fetchGoals();
    } catch (error: any) {
      showToast(error.message || 'Failed to save goal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateProgress = (goal: SavingsGoal): number => {
    if (goal.target_amount <= 0) return 0;
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  };

  const getDaysRemaining = (goal: SavingsGoal): number | null => {
    if (!goal.target_date) return null;
    const today = new Date();
    const targetDate = new Date(goal.target_date);
    return differenceInDays(targetDate, today);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Savings Goals</h1>
          <p className="text-gray-600 mt-1">Track your progress toward financial goals</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No savings goals yet.</p>
          <Button onClick={handleCreate} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Goal
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = calculateProgress(goal);
            const daysRemaining = getDaysRemaining(goal);
            const monthlySavingsNeeded = goal.target_date ? calculateMonthlySavingsNeeded(goal) : 0;
            const isCompleted = progress >= 100;

            return (
              <Card key={goal.id} className="p-6 relative overflow-hidden">
                {isCompleted && (
                  <div className="absolute top-4 right-4">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                  </div>
                )}

                <div className="mb-4">
                  <div
                    className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center"
                    style={{ backgroundColor: goal.color }}
                  >
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{goal.name}</h3>
                  {goal.notes && (
                    <p className="text-sm text-gray-600 mb-3">{goal.notes}</p>
                  )}
                </div>

                <div className="mb-4">
                  <ProgressBar
                    current={goal.current_amount}
                    target={goal.target_amount}
                    color={goal.color}
                  />
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-semibold text-gray-900">
                      ${goal.current_amount.toFixed(2)} / ${goal.target_amount.toFixed(2)}
                    </span>
                  </div>

                  {goal.target_date && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Target Date:
                        </span>
                        <span className="text-gray-900">
                          {new Date(goal.target_date).toLocaleDateString()}
                        </span>
                      </div>

                      {daysRemaining !== null && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Days Remaining:</span>
                          <span className={`font-medium ${daysRemaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {daysRemaining < 0 ? 'Overdue' : `${daysRemaining} days`}
                          </span>
                        </div>
                      )}

                      {monthlySavingsNeeded > 0 && !isCompleted && (
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="text-gray-600 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Monthly Needed:
                          </span>
                          <span className="font-semibold text-primary-600">
                            ${monthlySavingsNeeded.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {isCompleted && (
                  <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 text-center font-medium">
                      Goal Achieved!
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(goal)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(goal)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedGoal(undefined);
        }}
        title={selectedGoal ? 'Edit Goal' : 'New Savings Goal'}
      >
        <GoalForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setSelectedGoal(undefined);
          }}
          initialData={selectedGoal}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setGoalToDelete(undefined);
        }}
        onConfirm={confirmDelete}
        title="Delete Goal"
        message={`Are you sure you want to delete "${goalToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
