import { useState, useEffect } from 'react';
import type { NetWorthSnapshot } from '../types';
import {
  getNetWorthSnapshots,
  createNetWorthSnapshot,
  updateNetWorthSnapshot,
  deleteNetWorthSnapshot,
  calculateCurrentNetWorth,
  takeSnapshot,
  calculateNetWorthChange
} from '../services/networth.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/ToastContainer';
import { Plus, Edit, Trash2, Camera, TrendingUp, TrendingDown } from 'lucide-react';
import NetWorthForm from '../components/networth/NetWorthForm';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function NetWorthPage() {
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>([]);
  const [currentNetWorth, setCurrentNetWorth] = useState({
    total_assets: 0,
    total_liabilities: 0,
    net_worth: 0
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<NetWorthSnapshot | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [snapshotToDelete, setSnapshotToDelete] = useState<NetWorthSnapshot | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [takingSnapshot, setTakingSnapshot] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [snapshotsData, currentData] = await Promise.all([
        getNetWorthSnapshots(),
        calculateCurrentNetWorth()
      ]);
      setSnapshots(snapshotsData);
      setCurrentNetWorth(currentData);
    } catch (error: any) {
      showToast(error.message || 'Failed to load net worth data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeSnapshot = async () => {
    try {
      setTakingSnapshot(true);
      await takeSnapshot();
      showToast('Snapshot created', 'success');
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to create snapshot', 'error');
    } finally {
      setTakingSnapshot(false);
    }
  };

  const handleCreate = () => {
    setSelectedSnapshot(undefined);
    setShowModal(true);
  };

  const handleEdit = (snapshot: NetWorthSnapshot) => {
    setSelectedSnapshot(snapshot);
    setShowModal(true);
  };

  const handleDelete = (snapshot: NetWorthSnapshot) => {
    setSnapshotToDelete(snapshot);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!snapshotToDelete) return;

    try {
      await deleteNetWorthSnapshot(snapshotToDelete.id);
      showToast('Snapshot deleted', 'success');
      setShowDeleteConfirm(false);
      setSnapshotToDelete(undefined);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete snapshot', 'error');
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (selectedSnapshot) {
        await updateNetWorthSnapshot(selectedSnapshot.id, data);
        showToast('Snapshot updated', 'success');
      } else {
        await createNetWorthSnapshot(data);
        showToast('Snapshot created', 'success');
      }
      setShowModal(false);
      setSelectedSnapshot(undefined);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to save snapshot', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getNetWorthChange = () => {
    if (snapshots.length < 2) return null;
    return calculateNetWorthChange(snapshots);
  };

  const prepareChartData = () => {
    return snapshots.map((snapshot) => ({
      date: new Date(snapshot.snapshot_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      'Net Worth': snapshot.net_worth,
      'Assets': snapshot.total_assets,
      'Liabilities': snapshot.total_liabilities
    }));
  };

  const netWorthChange = getNetWorthChange();
  const chartData = prepareChartData();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Net Worth</h1>
          <p className="text-gray-600 mt-1">Track your financial progress over time</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleTakeSnapshot}
            variant="secondary"
            disabled={takingSnapshot}
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Snapshot
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Manual Entry
          </Button>
        </div>
      </div>

      {/* Current Net Worth Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Assets</p>
              <p className="text-2xl font-bold text-green-600">
                ${currentNetWorth.total_assets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Liabilities</p>
              <p className="text-2xl font-bold text-red-600">
                ${currentNetWorth.total_liabilities.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Net Worth</p>
              <p className={`text-2xl font-bold ${currentNetWorth.net_worth >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
                ${Math.abs(currentNetWorth.net_worth).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              {netWorthChange && (
                <p className={`text-sm mt-1 flex items-center gap-1 ${netWorthChange.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netWorthChange.amount >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {netWorthChange.amount >= 0 ? '+' : ''}
                  ${Math.abs(netWorthChange.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  ({netWorthChange.percentage >= 0 ? '+' : ''}
                  {netWorthChange.percentage.toFixed(1)}%)
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Net Worth Over Time</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Net Worth"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Assets"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="Liabilities"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Historical Snapshots Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historical Snapshots</h2>
        </div>

        {snapshots.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No snapshots yet.</p>
            <Button onClick={handleTakeSnapshot} className="mt-4" variant="secondary">
              <Camera className="h-4 w-4 mr-2" />
              Take Your First Snapshot
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assets
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liabilities
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Worth
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {snapshots.slice().reverse().map((snapshot) => (
                  <tr key={snapshot.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(snapshot.snapshot_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                      ${snapshot.total_assets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                      ${snapshot.total_liabilities.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">
                      <span className={snapshot.net_worth >= 0 ? 'text-primary-600' : 'text-red-600'}>
                        ${Math.abs(snapshot.net_worth).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(snapshot)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(snapshot)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedSnapshot(undefined);
        }}
        title={selectedSnapshot ? 'Edit Snapshot' : 'New Manual Snapshot'}
      >
        <NetWorthForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setSelectedSnapshot(undefined);
          }}
          initialData={selectedSnapshot}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSnapshotToDelete(undefined);
        }}
        onConfirm={confirmDelete}
        title="Delete Snapshot"
        message="Are you sure you want to delete this net worth snapshot? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
