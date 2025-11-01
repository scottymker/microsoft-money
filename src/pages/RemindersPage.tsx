import { useState, useEffect } from 'react';
import type { Reminder } from '../types';
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  toggleReminderPaid
} from '../services/reminders.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/ToastContainer';
import { Plus, Edit, Trash2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import ReminderForm from '../components/reminders/ReminderForm';
import { differenceInDays } from 'date-fns';

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const data = await getReminders(true); // Include completed
      setReminders(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load reminders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedReminder(undefined);
    setShowModal(true);
  };

  const handleEdit = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setShowModal(true);
  };

  const handleDelete = (reminder: Reminder) => {
    setReminderToDelete(reminder);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!reminderToDelete) return;

    try {
      await deleteReminder(reminderToDelete.id);
      showToast('Reminder deleted', 'success');
      setShowDeleteConfirm(false);
      setReminderToDelete(undefined);
      fetchReminders();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete reminder', 'error');
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (selectedReminder) {
        await updateReminder(selectedReminder.id, data);
        showToast('Reminder updated', 'success');
      } else {
        await createReminder(data);
        showToast('Reminder created', 'success');
      }
      setShowModal(false);
      setSelectedReminder(undefined);
      fetchReminders();
    } catch (error: any) {
      showToast(error.message || 'Failed to save reminder', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePaid = async (reminder: Reminder) => {
    try {
      await toggleReminderPaid(reminder.id);
      showToast(reminder.is_paid ? 'Marked as unpaid' : 'Marked as paid', 'success');
      fetchReminders();
    } catch (error: any) {
      showToast(error.message || 'Failed to update reminder', 'error');
    }
  };

  const getStatusInfo = (reminder: Reminder) => {
    if (reminder.is_paid) {
      return {
        badge: 'Paid',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle2,
        iconColor: 'text-green-600'
      };
    }

    const today = new Date();
    const dueDate = new Date(reminder.due_date);
    const daysUntilDue = differenceInDays(dueDate, today);

    if (daysUntilDue < 0) {
      return {
        badge: 'Overdue',
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle,
        iconColor: 'text-red-600'
      };
    } else if (daysUntilDue <= 7) {
      return {
        badge: 'Due Soon',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        iconColor: 'text-yellow-600'
      };
    }

    return {
      badge: 'Upcoming',
      color: 'bg-blue-100 text-blue-800',
      icon: Clock,
      iconColor: 'text-blue-600'
    };
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bill Reminders</h1>
          <p className="text-gray-600 mt-1">Track upcoming bills and payment due dates</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {reminders.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No reminders yet.</p>
          <Button onClick={handleCreate} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Reminder
          </Button>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reminders.map((reminder) => {
                const statusInfo = getStatusInfo(reminder);
                const StatusIcon = statusInfo.icon;

                return (
                  <tr key={reminder.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{reminder.title}</div>
                        {reminder.category && (
                          <div className="text-sm text-gray-500">{reminder.category}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {reminder.amount ? (
                        <span className="text-gray-900 font-medium">
                          ${reminder.amount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(reminder.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 capitalize">
                        {reminder.frequency?.replace('-', ' ') || 'One-time'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
                        <StatusIcon className={`h-3 w-3 ${statusInfo.iconColor}`} />
                        {statusInfo.badge}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePaid(reminder)}
                          aria-label={reminder.is_paid ? 'Mark as unpaid' : 'Mark as paid'}
                        >
                          <CheckCircle2 className={`h-4 w-4 ${reminder.is_paid ? 'text-green-600' : 'text-gray-400'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(reminder)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(reminder)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedReminder(undefined);
        }}
        title={selectedReminder ? 'Edit Reminder' : 'New Reminder'}
      >
        <ReminderForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setSelectedReminder(undefined);
          }}
          initialData={selectedReminder}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setReminderToDelete(undefined);
        }}
        onConfirm={confirmDelete}
        title="Delete Reminder"
        message={`Are you sure you want to delete "${reminderToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
