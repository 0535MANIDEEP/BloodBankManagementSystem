import React, { useEffect, useState } from 'react';
import InventoryService from '../../services/InventoryService';
import Table from '../../components/ui/Table';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Plus, Trash2, CalendarClock, Sparkles } from 'lucide-react';

export const ManageInventory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Add Item Modal form states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    bloodGroup: 'A+',
    units: '1',
    expiryDate: '',
    donorEmail: ''
  });

  const [cleaning, setCleaning] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await InventoryService.getInventory();
      setInventory(res.data.inventory);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.expiryDate) {
      setError('Expiry date is required');
      return;
    }

    setAdding(true);
    setError(null);
    setSuccess(null);

    try {
      await InventoryService.addBag({
        bloodGroup: formData.bloodGroup,
        units: parseInt(formData.units),
        expiryDate: formData.expiryDate,
        donorEmail: formData.donorEmail || null
      });

      setSuccess('Blood unit logged into stock successfully!');
      setAddModalOpen(false);
      setFormData({
        bloodGroup: 'A+',
        units: '1',
        expiryDate: '',
        donorEmail: ''
      });
      fetchInventory();
    } catch (err: any) {
      setError(err.message || 'Failed to add blood unit.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to discard this blood bag?')) return;
    setError(null);
    setSuccess(null);
    try {
      await InventoryService.deleteBag(id);
      setSuccess('Blood bag successfully removed from stock.');
      fetchInventory();
    } catch (err: any) {
      setError(err.message || 'Failed to remove blood bag.');
    }
  };

  const handleAutoClean = async () => {
    setCleaning(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await InventoryService.cleanExpired();
      setSuccess(res.message);
      fetchInventory();
    } catch (err: any) {
      setError(err.message || 'Failed to clean expired units.');
    } finally {
      setCleaning(false);
    }
  };

  const columns = [
    {
      header: 'Added Date',
      accessor: (row: any) => new Date(row.addedDate).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      })
    },
    { header: 'Blood Group', accessor: 'bloodGroup', className: 'font-bold text-blood' },
    { header: 'Units', accessor: (row: any) => `${row.units} Bag(s)` },
    {
      header: 'Expiry Date',
      accessor: (row: any) => (
        <span className="flex items-center gap-1">
          <CalendarClock className="h-4 w-4 text-slate-400" />
          <span>{new Date(row.expiryDate).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          })}</span>
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          row.status === 'available' ? 'bg-green-100 text-green-800' :
          row.status === 'assigned' ? 'bg-sky-100 text-sky-800' :
          'bg-rose-100 text-rose-800'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Donor Name',
      accessor: (row: any) => row.donor?.name || <span className="text-slate-400 italic">Direct Entry</span>
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <button
          onClick={() => handleDelete(row._id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          title="Discard Bag"
        >
          <Trash2 className="h-4.5 w-4.5" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Manage Blood Inventory
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log new donations, manage current bags, and handle expiration cycles.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            loading={cleaning}
            onClick={handleAutoClean}
            icon={<Sparkles className="h-4 w-4 text-blood" />}
          >
            Clear Expired Bags
          </Button>
          <Button
            onClick={() => setAddModalOpen(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            Add Blood Bag
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          {success}
        </div>
      )}

      {/* Main Stock Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Stock Registry Logs
        </h3>
        <Table
          columns={columns}
          data={inventory}
          loading={loading}
          emptyMessage="No blood bags currently in stock."
        />
      </div>

      {/* Add Blood Bag Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Blood Bag to Inventory"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Blood Group
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="glass-input px-4 py-2.5 text-sm w-full bg-white dark:bg-[#1E1E1E]"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <Input
              label="Bags Count (Units)"
              name="units"
              type="number"
              min="1"
              value={formData.units}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Expiry Date"
            name="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={handleChange}
          />

          <Input
            label="Donor Email (Optional)"
            name="donorEmail"
            value={formData.donorEmail}
            onChange={handleChange}
            placeholder="e.g. donor@email.com"
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={adding}>
              Add Bag
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageInventory;
